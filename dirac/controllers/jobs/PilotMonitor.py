import logging
from time import time, gmtime, strftime

from DIRAC.Core.Utilities import Time

from dirac.lib.base import *
from dirac.lib.diset import getRPCClient
from dirac.lib.credentials import authorizeAction
#from dirac.lib.sessionManager import *
from DIRAC import gLogger
import dirac.lib.credentials as credentials

log = logging.getLogger(__name__)

class PilotmonitorController(BaseController):
################################################################################
  def display(self):
    pagestart = time()
    lhcbGroup = credentials.getSelectedGroup()
    if lhcbGroup == "visitor":
      return render("/login.mako")
    c.select = self.__getSelectionData()
    gLogger.info("\033[0;31m !!!! \033[0m %s" % c.select)
    return render("jobs/PilotMonitor.mako")
################################################################################
  @jsonify
  def submit(self):
    pagestart = time()
    lhcbGroup = credentials.getSelectedGroup()
    if lhcbGroup == "visitor":
      c.result = {"success":"false","error":"You are not authorised"}
      return c.result
    RPC = getRPCClient("WorkloadManagement/WMSAdministrator")
    result = self.__request()
    result = RPC.getPilotMonitorWeb(result,globalSort,pageNumber,numberOfJobs)
    if result["OK"]:
      result = result["Value"]
      if result.has_key("TotalRecords") and  result["TotalRecords"] > 0:
        if result.has_key("ParameterNames") and result.has_key("Records"):
          if len(result["ParameterNames"]) > 0:
            if len(result["Records"]) > 0:
              c.result = []
              jobs = result["Records"]
              head = result["ParameterNames"]
              headLength = len(head)
              for i in jobs:
                tmp = {}
                for j in range(0,headLength):
                  if j == 12:
                    if i[j] == 0:
                      i[j] = "-"
                  tmp[head[j]] = i[j]
                c.result.append(tmp)
              total = result["TotalRecords"]
              if result.has_key("Extras"):
                extra = result["Extras"]
                c.result = {"success":"true","result":c.result,"total":total,"extra":extra}
              else:
                c.result = {"success":"true","result":c.result,"total":total}
            else:
              c.result = {"success":"false","result":"","error":"There are no data to display"}
          else:
            c.result = {"success":"false","result":"","error":"ParameterNames field is undefined"}
        else:
          c.result = {"success":"false","result":"","error":"Data structure is corrupted"}
      else:
        c.result = {"success":"false","result":"","error":"There were no data matching your selection"}
    else:
      c.result = {"success":"false","error":result["Message"]}
    gLogger.info("\033[0;31mJOB SUBMIT REQUEST:\033[0m %s" % (time() - pagestart))
    return c.result
################################################################################
  def __getSelectionData(self):
    callback = {}
    lhcbGroup = credentials.getSelectedGroup()
    lhcbUser = str(credentials.getUsername())
    if len(request.params) > 0:
      tmp = {}
      for i in request.params:
        tmp[i] = str(request.params[i]).replace('"','')
      callback["extra"] = tmp
###
    RPC = getRPCClient("WorkloadManagement/WMSAdministrator")
    result = RPC.getPilotMonitorSelectors()
    if result["OK"]:
      result = result["Value"]
      gLogger.info("\033[0;31m *** \033[0m %s",result)
      if result.has_key("Status") and len(result["Status"]) > 0:
        status = []
        status.append([str("All")])
        for i in result["Status"]:
          status.append([str(i)])
      else:
        status = [["Nothing to display"]]
      callback["status"] = status
      if result.has_key("GridType") and len(result["GridType"]) > 0:
        gridtype = []
        gridtype.append([str("All")])
        for i in result["GridType"]:
          gridtype.append([str(i)])
      else:
        gridtype = [["Nothing to display"]]
      callback["gridtype"] = gridtype
      if result.has_key("OwnerGroup") and len(result["OwnerGroup"]) > 0:
        ownerGroup = []
        ownerGroup.append([str("All")])
        for i in result["OwnerGroup"]:
          ownerGroup.append([str(i)])
      else:
        ownerGroup = [["Nothing to display"]]
      callback["ownerGroup"] = ownerGroup
      if result.has_key("DestinationSite") and len(result["DestinationSite"]) > 0:
        ce = []
        ce.append([str("All")])
        for i in result["DestinationSite"]:
          ce.append([str(i)])
      else:
        ce = [["Nothing to display"]]
      callback["ce"] = ce
      if result.has_key("GridSite") and len(result["GridSite"]) > 0:
        site = []
        site.append([str("All")])
        for i in result["GridSite"]:
          site.append([str(i)])
      else:
        site = [["Nothing to display"]]
      callback["site"] = site
      if result.has_key("Broker") and len(result["Broker"]) > 0:
        broker = []
        broker.append([str("All")])
        for i in result["Broker"]:
          broker.append([str(i)])
      else:
        broker = [["Nothing to display"]]
      callback["broker"] = broker
      if result.has_key("Owner") and len(result["Owner"]) > 0:
        owner = []
        owner.append([str("All")])
        for i in result["Owner"]:
#          j = 
          owner.append([str(i)])
      else:
        owner = [["Nothing to display"]]
      callback["owner"] = owner
###
    return callback
################################################################################
  def __request(self):
    req = {}
    lhcbGroup = credentials.getSelectedGroup()
    lhcbUser = str(credentials.getUsername())
    global pageNumber
    if request.params.has_key("id") and len(request.params["id"]) > 0:
      pageNumber = 0
      req["JobID"] = str(request.params["id"])
    else:
      global numberOfJobs
      global globalSort
      if request.params.has_key("limit") and len(request.params["limit"]) > 0:
        if request.params.has_key("start") and len(request.params["start"]) > 0:
          numberOfJobs = int(request.params["limit"])
          pageNumber = int(request.params["start"])
        else:
          pageNumber = 0
      else:
        numberOfJobs = 25
      if request.params.has_key("broker") and len(request.params["broker"]) > 0:
        if str(request.params["broker"]) != "All":
          req["Broker"] = str(request.params["broker"]).split('::: ')
      if request.params.has_key("site") and len(request.params["site"]) > 0:
        if str(request.params["site"]) != "All":
          req["GridSite"] = str(request.params["site"]).split('::: ')
      if request.params.has_key("status") and len(request.params["status"]) > 0:
        if str(request.params["status"]) != "All":
          req["Status"] = str(request.params["status"]).split('::: ')
      if request.params.has_key("ce") and len(request.params["ce"]) > 0:
        req["DestinationSite"] = str(request.params["ce"]).split('::: ')
      if request.params.has_key("ownerGroup") and len(request.params["ownerGroup"]) > 0:
        if str(request.params["ownerGroup"]) != "All":
          req["OwnerGroup"] = str(request.params["ownerGroup"]).split('::: ')
      if request.params.has_key("owner") and len(request.params["owner"]) > 0:
        if str(request.params["owner"]) != "All":
          req["Owner"] = str(request.params["owner"]).split('::: ')
      if request.params.has_key("startDate") and len(request.params["startDate"]) > 0:
        if str(request.params["startDate"]) != "YYYY-mm-dd":
          if request.params.has_key("startTime") and len(request.params["startTime"]) > 0:
            req["FromDate"] = str(request.params["startDate"] + " " + request.params["startTime"])
          else:
            req["FromDate"] = str(request.params["startDate"])
      if request.params.has_key("endDate") and len(request.params["endDate"]) > 0:
        if str(request.params["endDate"]) != "YYYY-mm-dd":
          if request.params.has_key("endTime") and len(request.params["endTime"]) > 0:
            req["ToDate"] = str(request.params["endDate"] + " " + request.params["endTime"])
          else:
            req["ToDate"] = str(request.params["endDate"])
      if request.params.has_key("date") and len(request.params["date"]) > 0:
        if str(request.params["date"]) != "YYYY-mm-dd":
          req["LastUpdate"] = str(request.params["date"])
      if request.params.has_key("sort") and len(request.params["sort"]) > 0:
        globalSort = str(request.params["sort"])
        key,value = globalSort.split(" ")
        globalSort = [[str(key),str(value)]]
      else:
        globalSort = [["SubmissionTime","DESC"]]
    gLogger.info("REQUEST:",req)
    return req
################################################################################
  @jsonify
  def action(self):
    if request.params.has_key("getPilotOutput"):
      ref = str(request.params["getPilotOutput"])
      return self.__getPilotOutput(ref)
################################################################################
  def __getPilotOutput(self,pilotReference):
    RPC = getRPCClient("WorkloadManagement/WMSAdministrator")
    result = RPC.getPilotOutput(pilotReference)
    if result["OK"]:
      c.result = result["Value"]
      c.result = {"success":"true","result":c.result}
    else:
      c.result = {"success":"false","error":result["Message"]}
    return c.result
