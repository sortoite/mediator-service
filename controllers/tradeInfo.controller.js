/** @format */
var moment = require("moment")

var tradeInfoModel = require("../models/tradeInfo.model");

/**
 * tradeInfoController.js
 *
 * @description :: Server-side logic for managing tradeInfos.
 */


const getHourMinute = time => {
  const data = time.split((/[: ]/))
  return [parseInt(data[0]), parseInt(data[1])]
}

module.exports = {
  /**
   * tradeInfoController.create()
   */
  create: async (req, res) => {
    
    let [data, type, time] = [req.body.res, req.body.name, req.body.upTime]
    
    if(time === undefined) time = new Date().toISOString()

    if(type === "cbr" || type === "energy") {
      time = new Date().toISOString()
    }

    if(type === "forex") {
      let upTime = new moment()
      let [hour, minute] = getHourMinute(time)
      if(upTime.hour() > hour) upTime = upTime.add(1, 'day')
      upTime.set({hour: hour, minute: minute, second: 0})
      upTime.subtract(10, 'hour')
      time = upTime.format('YYYY-MM-DD HH:mm:ss')

    }

    if(type === "boc") {
      let upTime = new moment(time, "YYYY-MM-DD HH:mm:ss")
      upTime = upTime.add(1, 'hour')
      time = upTime.format('YYYY-MM-DD HH:mm:ss')
    }

    const newInfo = new tradeInfoModel ({
      type: type,
      data: data,
      upTime: time,
      isSync: false
    })

    newInfo.save(function (err, newInfo) {
      if (err) {
        return res.status(500).json({
          message: "Error when saving tradeInfo",
          error: err,
        });
      }

      return res.status(201).json(data);
    });
  },
  /**
   * tradeInfoController.create()
   * fetch data whose isSync is false
   * request parm: []
   * response param: [status, tradeInfo]
   */
  fetch: async (req, res) => {
    tradeInfoModel.find({ isSync: false }, function (err, tradeInfo) {
      if (err) {
        return res.status(500).json({
          message: "Error when fetching tradeInfo whose isSync is false.",
          error: err,
        });
      }


      return res.json(tradeInfo);
    });
  },

  /**
   * tradeInfoController.fetchSucced()
   * success so that need to make sign
   * request param: [id: array]
   * response param: [status]
   */
  fetchSucced: async (req, res) => {
    const id = req.body.id

    tradeInfoModel.updateMany({_id: {$in: id}}, {isSync: true}, (err, tradeInfo) => {
      if(err) {
        return res.status(500).json({
          message: "Error when signing tradeIfno to make isSync true",
          error: err
        })
      }
      return res.json(tradeInfo)
    })
    
  }



 
};
