package main

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"net/url"
	"regexp"
	"strings"

	sls "github.com/aliyun/aliyun-log-go-sdk"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
)

func newResourceHandler(ds *SlsDatasource) backend.CallResourceHandler {
	mux := http.NewServeMux()

	// register route
	mux.HandleFunc("/api/gotoSLS", ds.gotoSLS)
	mux.HandleFunc("/api/version", ds.serveVersion)
	mux.HandleFunc("/api/getLogstoreList", ds.getLogstoreList)

	return httpadapter.New(mux)
}

func (ds *SlsDatasource) serveVersion(w http.ResponseWriter, r *http.Request) {
	// Handle query request...
}

type ListLogstoresData struct {
	Project       string
	TelemetryType string
}

func (ds *SlsDatasource) getLogstoreList(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"data":    []map[string]interface{}{}, // 定义 data 为一个任意类型的对象数组
		"res":     nil,
		"message": "",
	}

	config, err := LoadSettings(httpadapter.PluginConfigFromContext(r.Context()))
	if err != nil {
		response["message"] = err.Error()
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	client := &sls.Client{
		Endpoint:        config.Endpoint,
		AccessKeyID:     config.AccessKeyId,
		AccessKeySecret: config.AccessKeySecret,
		UserAgent:       "grafana-go",
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		response["message"] = err.Error()
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 解析request JSON 数据
	var data ListLogstoresData
	if err := json.Unmarshal(body, &data); err != nil {
		response["message"] = err.Error()
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	log.DefaultLogger.Info("getBODY", "body", body, "bodyData", data)

	// 拿当前 Project 的信息
	list, err := client.ListLogStoreV2(data.Project, 0, 500, data.TelemetryType)
	if err != nil {
		response["message"] = err.Error()
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	response["data"] = list
	response["res"] = list

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
	log.DefaultLogger.Info("get logstore success.")
}

type Data struct {
	Encoding string `json:"encoding"`
}

func (ds *SlsDatasource) gotoSLS(w http.ResponseWriter, r *http.Request) {

	response := map[string]interface{}{
		"message": "",
		"err":     "",
		"url":     "",
		// "policy":  "",
	}

	config, err := LoadSettings(httpadapter.PluginConfigFromContext(r.Context()))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ak := config.AccessKeyId
	sk := config.AccessKeySecret
	arn := config.RoleArn
	prj := config.Project
	logstore := config.LogStore

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// 解析request JSON 数据
	var data Data
	if err := json.Unmarshal(body, &data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	pattern := `^acs:ram::\d+:role\/[^\/]+$`
	regex, err := regexp.Compile(pattern)
	if err != nil {
		return
	}

	normalJump := false

	if len(arn) == 0 {
		normalJump = true
	} else {
		if !regex.MatchString(arn) {
			response["err"] = "regexCheckError"
			response["message"] = "roleArn 不符合格式，请检查。"
			normalJump = true
		}
	}

	if !normalJump {
		roleName := strings.Split(arn, "/")[1]
		_, err2 := roleCheck(ak, sk, roleName)
		if err2 != nil {
			response["err"] = "roleCheckError"
			response["message"] = err2.Error()
			// http.Error(w, err2.Error(), http.StatusBadRequest)
			// return
			normalJump = true
		}
		// response["policy"] = p
	}

	if !normalJump {
		client := NewClient(ak, sk, arn, "default")
		stsResp, err := client.AssumeRole(900)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			log.DefaultLogger.Error(err.Error())
			// response["err"] = err.Error()
			// response["message"] = err.Error()
			// w.Header().Set("Content-Type", "application/json")
			// w.WriteHeader(http.StatusInternalServerError)
			// json.NewEncoder(w).Encode(response)
			return
		}
		id := stsResp.Credentials.AccessKeyId
		secret := stsResp.Credentials.AccessKeySecret
		token := stsResp.Credentials.SecurityToken

		// 使用STS Token换取控制台Signin Token
		SigninResp, err := getSigninToken(id, secret, token)
		if err != nil {
			panic(err)
		}
		signinToken := SigninResp.SigninToken

		// 生成登录链接
		loginUrl := "http://www.aliyun.com"
		// destination := "http://sls4service.console.aliyun.com"
		destination := "http://sls4service.console.aliyun.com/lognext/project/" + prj + "/logsearch/" + logstore + "?isShare=true&hideTopbar=true&hideSidebar=true&ignoreTabLocalStorage=true&" + data.Encoding
		url, err := genSigninUrl(signinToken, loginUrl, destination)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			log.DefaultLogger.Error(err.Error())
			return
		}

		response["url"] = url
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(response)
		log.DefaultLogger.Info("Goto SLS with STS success.", url)
		return
	}
	url := "https://sls.console.aliyun.com/lognext/project/" + prj + "/logsearch/" + logstore + "?" + data.Encoding
	response["url"] = url
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
	log.DefaultLogger.Info("Goto SLS with Normal jump success.", url)
}

func getSigninToken(id string, secret string, token string) (*SigninResponse, error) {
	urlStr := "http://signin.aliyun.com/federation?Action=GetSigninToken"
	urlStr += "&AccessKeyId=" + id
	urlStr += "&AccessKeySecret=" + secret
	urlStr += "&SecurityToken=" + url.QueryEscape(token)
	urlStr += "&TicketType=mini"

	res, err := http.Get(urlStr)
	if err != nil {
		return nil, err
	}
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	// fmt.Println("SigninToken json:", string(body))
	resp := SigninResponse{}
	err = json.Unmarshal(body, &resp)
	if err != nil {
		return nil, err
	}
	return &resp, nil
}

func genSigninUrl(signinToken string, loginUrl string, destination string) (string, error) {
	urlStr := "http://signin.aliyun.com/federation?Action=Login"
	urlStr += "&LoginUrl=" + url.QueryEscape(loginUrl)
	urlStr += "&Destination=" + url.QueryEscape(destination)
	urlStr += "&SigninToken=" + url.QueryEscape(signinToken)
	client := &http.Client{
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}
	res, err := client.Get(urlStr)
	if err != nil {
		return "", err
	}
	location, err := res.Location()
	if err != nil {
		return "", err
	}
	locationUrl := location.String()
	return locationUrl, nil
}

type SigninResponse struct {
	SigninToken string
}
