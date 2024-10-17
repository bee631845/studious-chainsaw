package main

import (
	"errors"
	"strings"

	"github.com/aliyun/alibaba-cloud-sdk-go/sdk"
	"github.com/aliyun/alibaba-cloud-sdk-go/sdk/auth/credentials"
	ram "github.com/aliyun/alibaba-cloud-sdk-go/services/ram"
)

var POLICY_LEN_ERROR = "policy length should be 1. Role policy should ONLY have AliyunLogReadOnlyAccess."
var RAM_NO_PERMISSION_ERROR = "configured user should have AliyunRAMReadOnlyAccess."
var POLYCY_NOT_MATCH_ERROR = "role policy should only have AliyunLogReadOnlyAccess."

func roleCheck(ak string, sk string, roleName string) ([]ram.Policy, error) {
	config := sdk.NewConfig()
	credential := credentials.NewAccessKeyCredential(ak, sk)
	// log.DefaultLogger.Info("roleName", roleName)
	client, err := ram.NewClientWithOptions("cn-hangzhou", config, credential)
	if err != nil {
		return nil, err
	}
	request := ram.CreateListPoliciesForRoleRequest()
	request.Scheme = "https"
	request.RoleName = roleName

	response, err := client.ListPoliciesForRole(request)
	if err != nil {
		s := err.Error()
		if strings.Contains(s, "NoPermission") {
			return nil, errors.New(RAM_NO_PERMISSION_ERROR)
		}
		return nil, err
	}
	policyList := response.Policies.Policy
	len := len(policyList)
	if len != 1 {
		return nil, errors.New(POLICY_LEN_ERROR)
	}
	if policyList[0].PolicyName != "AliyunLogReadOnlyAccess" {
		return nil, errors.New(POLYCY_NOT_MATCH_ERROR)
	}
	return policyList, nil
}
