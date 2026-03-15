const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
title:String,
description:String,
priority:String,
dueDate:Date,
completed:Boolean,
userId:String
})

module.exports = mongoose.model("Task",taskSchema)