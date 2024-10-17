package main

import (
	"encoding/json"
	"io/ioutil"
	_ "net/http/pprof"
	"os"
	"path/filepath"
	"strconv"

	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/log"
)

func main() {
	// Start listening to requests sent from Grafana. This call is blocking so
	// it won't finish until Grafana shuts down the process or the plugin choose
	// to exit by itself using os.Exit. Manage automatically manages life cycle
	// of datasource instances. It accepts datasource instance factory as first
	// argument. This factory will be automatically called on incoming request
	// from Grafana to create different instances of SampleDatasource (per datasource
	// ID). When datasource configuration changed Dispose method will be called and
	// new datasource instance created using NewSampleDatasource factory.

	loadConfig()
	// if err := datasource.Manage("aliyun-log-backend-datasource", NewSLSDatasource, datasource.ManageOpts{}); err != nil {
	// 	log.DefaultLogger.Error(err.Error())
	// 	os.Exit(1)
	// }
	err := datasource.Serve(NewSLSDatasource())
	grafanaVersion := os.Getenv("GF_VERSION")
	log.DefaultLogger.Info("GF_VERSION", grafanaVersion)

	if err != nil {
		log.DefaultLogger.Error(err.Error())
		os.Exit(1)
	}
}

var maxPointsLimit = 6000000
var compatible = false

func loadConfig() {
	ex, err := os.Executable()
	if err != nil {
		log.DefaultLogger.Info("", err)
		return
	}
	exPath := filepath.Dir(ex)
	b, err := ioutil.ReadFile(exPath + "/plugin.json")
	if err != nil {
		log.DefaultLogger.Info("", err)
		return
	}
	m := map[string]interface{}{}
	err = json.Unmarshal(b, &m)
	if err != nil {
		log.DefaultLogger.Info("", err)
		return
	}
	maxPointsI := m["flow_chart_max_points"]
	if maxPointsI == nil {
		return
	}
	if _, ok := maxPointsI.(string); !ok {
		return
	}
	parseInt, err := strconv.ParseInt(maxPointsI.(string), 0, 0)
	if err != nil {
		log.DefaultLogger.Info("", err)
		return
	}
	maxPointsLimit = int(parseInt)

	compatibleI := m["legacy_compatible"]
	if compatibleI == nil {
		return
	}
	if _, ok := compatibleI.(bool); ok {
		compatible = compatibleI.(bool)
	}
}
