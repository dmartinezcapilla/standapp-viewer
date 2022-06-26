(function(views)
{
    var self;

    const US_KEY = 0;
    const US_DESCRIPTION = 1;
    const US_USP = 2;
    const US_TYPE = 3;
    const US_TYPE_ICON = 4;
    const US_STATUS = 5;
    const US_STATUS_ICON = 6;
    const DEV_TIME_ESTIMATED = 7;
    const DEV_TIME_LOGGED = 8;
    const DEV_TIME_REMAINING = 9;
    const DEV_DEVIATION = 10;
    const AT_TIME_ESTIMATED = 11;
    const AT_TIME_LOGGED = 12;
    const AT_TIME_REMAINING = 13;
    const AT_DEVIATION = 14;
    const TEST_TIME_ESTIMATED = 15;
    const TEST_TIME_LOGGED = 16;
    const TEST_TIME_REMAINING = 17;
    const TEST_DEVIATION = 18;
    const FINDINGS_LOGGED = 19;
    const STORY_DEVIATION = 20;


    function MetricsView(presenter)
    {
        this.presenter = presenter;
    }

    Object.defineProperties(MetricsView.prototype,
    {
        init : {
            value: function()
            {
                $("#toolbar-window .advanced").off("click").on("click", function()
                {
                    $("#scrum-helper").show();
                    $("#scrum-helper").addClass("running");
                    $("#close-scrum-helper-button").show();
                });

                $("#close-scrum-helper-button").click(function()
                {
                    $("#scrum-helper").hide();
                    $("#scrum-helper").removeClass("running");
                    $("#close-scrum-helper-button").hide();
                });

                $("#switch-sos").click(function() {

                    if($('#switch-sos-label').is('.is-checked')) {
                        $('.eos-field').show();
                        $('.sos-field').hide();
                    }
                    else {
                        $('.eos-field').hide();
                        $('.sos-field').show();
                    }
                });

                $("#switch-export").click(function() {

                    if($('#switch-export-label').is('.is-checked')) {
                        $('.non-export-field').hide();
                    }
                    else {
                        $('.non-export-field').show();
                    }
                });


            },
            enumerable: false
        },

        load : {
            value: function(data)
            {
                var self = this;
                var storyMetricsMap = new Map();

                var summaryRowValues = [];
                summaryRowValues[US_KEY] = "";
                summaryRowValues[US_DESCRIPTION] = "TOTALS";
                summaryRowValues[US_TYPE] ="";
                summaryRowValues[US_TYPE_ICON] = "";
                summaryRowValues[US_STATUS] = "";
                summaryRowValues[US_STATUS_ICON] = "";
                summaryRowValues[DEV_TIME_ESTIMATED] = 0;
                summaryRowValues[DEV_TIME_LOGGED] = 0;
                summaryRowValues[DEV_TIME_REMAINING] = 0;
                summaryRowValues[DEV_DEVIATION] = 0;
                summaryRowValues[AT_TIME_ESTIMATED] = 0;
                summaryRowValues[AT_TIME_LOGGED] = 0;
                summaryRowValues[AT_TIME_REMAINING] = 0;
                summaryRowValues[AT_DEVIATION] = 0;
                summaryRowValues[TEST_TIME_ESTIMATED] = 0;
                summaryRowValues[TEST_TIME_LOGGED] = 0;
                summaryRowValues[TEST_TIME_REMAINING] = 0;
                summaryRowValues[TEST_DEVIATION] = 0;
                summaryRowValues[FINDINGS_LOGGED] = 0;
                summaryRowValues[STORY_DEVIATION] = 0;
                storyMetricsMap.set("Summary", summaryRowValues);


                var snw_supportAnalyzer = new Map();
                snw_supportAnalyzer["totalUser"] =  0;
                snw_supportAnalyzer["totalOthers"] =  0;


                $.each( data.issues, function( key, issue )
                {

                    var issueTypeUserStory = g_issuetype_map.user_story[issue.fields.issuetype.id];

                    //console.log("Issue assignees: ", issue.fields.assignee);
                    if (issue.fields.assignee && issue.fields.assignee.name == g_evaluatedUser) {

                        $.each( issue.fields.worklog.worklogs, function( key2, worklog )
                        {
                            if (worklog.author.name == g_evaluatedUser){
                                snw_supportAnalyzer["totalUser"] += worklog.timeSpentSeconds;
                            }
                            else{
                                if (!snw_supportAnalyzer[worklog.author.name])
                                {
                                    snw_supportAnalyzer[worklog.author.name] = 0;
                                }
                                snw_supportAnalyzer[worklog.author.name] += worklog.timeSpentSeconds;
                                snw_supportAnalyzer["totalOthers"] += worklog.timeSpentSeconds;
                            }
                        });
                    }


                    if(issueTypeUserStory != undefined)
                    {
                        var storyInitialRowValues = [];
                        storyInitialRowValues[US_KEY] =issue.key;
                        storyInitialRowValues[US_DESCRIPTION] =issue.fields.summary;
                        storyInitialRowValues[US_USP] = issue.fields.customfield_10005;
                        storyInitialRowValues[US_TYPE] =issueTypeUserStory;
                        storyInitialRowValues[US_TYPE_ICON] = "<img class=\"issuetype\" src=\"" + issue.fields.issuetype.iconUrl + "\"/>";
                        storyInitialRowValues[US_STATUS] = "";
                        storyInitialRowValues[US_STATUS_ICON] = "<img class=\"statusicon\" src=\"" + issue.fields.status.iconUrl + "\"/>";
                        storyInitialRowValues[US_STATUS] = issue.fields.status;
                        storyInitialRowValues[DEV_TIME_ESTIMATED] = 0;
                        storyInitialRowValues[DEV_TIME_LOGGED] = 0;
                        storyInitialRowValues[DEV_TIME_REMAINING] = 0;
                        storyInitialRowValues[DEV_DEVIATION] = 0;
                        storyInitialRowValues[AT_TIME_ESTIMATED] = 0;
                        storyInitialRowValues[AT_TIME_LOGGED] = 0;
                        storyInitialRowValues[AT_TIME_REMAINING] = 0;
                        storyInitialRowValues[AT_DEVIATION] = 0;
                        storyInitialRowValues[TEST_TIME_ESTIMATED] = 0;
                        storyInitialRowValues[TEST_TIME_LOGGED] = 0;
                        storyInitialRowValues[TEST_TIME_REMAINING] = 0;
                        storyInitialRowValues[TEST_DEVIATION] = 0;
                        storyInitialRowValues[FINDINGS_LOGGED] = 0;
                        storyInitialRowValues[STORY_DEVIATION] = 0;

                        storyMetricsMap.set(issue.id,  storyInitialRowValues);

                        // console.log("issue:", issue);
                    }
                    else {
                        var subtask = issue;
                        var parentId = subtask.fields.parent.id;

                        if (storyMetricsMap.get(parentId) == undefined)
                        {
                            console.log("There is an error with issue", issue);
                        }
                        else
                        {
                            var timeEstimate = 0;
                            var timeLogged = 0;
                            var timeRemaining = 0;
                            if (issue.fields.timetracking.originalEstimateSeconds) {
                                timeEstimate += issue.fields.timetracking.originalEstimateSeconds / 3600;
                            }
                            if (issue.fields.timetracking.timeSpentSeconds) {
                                timeLogged += issue.fields.timetracking.timeSpentSeconds / 3600;
                            }
                            if (issue.fields.timetracking.remainingEstimateSeconds) {
                                timeRemaining += issue.fields.timetracking.remainingEstimateSeconds / 3600;
                            }

                            if (self.getSubtaskType(subtask) != "finding") {
                                var remTimeColIndex = -1;
                                var estTimeColIndex = -1;
                                var logTimeColIndex = -1;
                                var deviationColIndex = -1;
                                if (self.getSubtaskType(subtask) == "dev") {
                                    remTimeColIndex = DEV_TIME_REMAINING;
                                    estTimeColIndex = DEV_TIME_ESTIMATED;
                                    logTimeColIndex = DEV_TIME_LOGGED;
                                    deviationColIndex = DEV_DEVIATION;
                                } else if (self.getSubtaskType(subtask) == "at") {
                                    remTimeColIndex = AT_TIME_REMAINING;
                                    estTimeColIndex = AT_TIME_ESTIMATED;
                                    logTimeColIndex = AT_TIME_LOGGED;
                                    deviationColIndex = AT_DEVIATION;
                                } else if (self.getSubtaskType(subtask) == "test") {
                                    remTimeColIndex = TEST_TIME_REMAINING;
                                    estTimeColIndex = TEST_TIME_ESTIMATED;
                                    logTimeColIndex = TEST_TIME_LOGGED;
                                    deviationColIndex = TEST_DEVIATION;
                                }
                                /*console.log("parentKey", parentKey, estTimeColIndex);
                                console.log(storyMetricsMap);
                                console.log("Key", key);
                                console.log("issue 2", issue);*/
                                storyMetricsMap.get(parentId)[estTimeColIndex] += timeEstimate;
                                storyMetricsMap.get(parentId)[logTimeColIndex] += timeLogged;
                                storyMetricsMap.get(parentId)[remTimeColIndex] += timeRemaining;
                                storyMetricsMap.get(parentId)[deviationColIndex] =
                                    (storyMetricsMap.get(parentId)[logTimeColIndex] -
                                        storyMetricsMap.get(parentId)[estTimeColIndex])
                                    / storyMetricsMap.get(parentId)[estTimeColIndex];
                                storyMetricsMap.get("Summary")[estTimeColIndex] += timeEstimate;
                                storyMetricsMap.get("Summary")[logTimeColIndex] += timeLogged;
                                storyMetricsMap.get("Summary")[remTimeColIndex] += timeRemaining;
                                storyMetricsMap.get("Summary")[deviationColIndex] =
                                    (storyMetricsMap.get("Summary")[logTimeColIndex] -
                                        storyMetricsMap.get("Summary")[estTimeColIndex])
                                    / storyMetricsMap.get("Summary")[estTimeColIndex];
                            } else // finding (half test, half dev)
                            {
                                storyMetricsMap.get(parentId)[DEV_TIME_ESTIMATED] += (timeEstimate / 2);
                                storyMetricsMap.get(parentId)[TEST_TIME_ESTIMATED] += (timeEstimate / 2);
                                storyMetricsMap.get(parentId)[DEV_TIME_LOGGED] += (timeLogged / 2);
                                storyMetricsMap.get(parentId)[TEST_TIME_LOGGED] += (timeLogged / 2);
                                storyMetricsMap.get(parentId)[DEV_TIME_REMAINING] += (timeRemaining / 2);
                                storyMetricsMap.get(parentId)[TEST_TIME_REMAINING] += (timeRemaining / 2);
                                storyMetricsMap.get(parentId)[DEV_DEVIATION] =
                                    (storyMetricsMap.get(parentId)[DEV_TIME_LOGGED] -
                                        storyMetricsMap.get(parentId)[DEV_TIME_ESTIMATED])
                                    / storyMetricsMap.get(parentId)[DEV_TIME_ESTIMATED];
                                storyMetricsMap.get(parentId)[TEST_DEVIATION] =
                                    (storyMetricsMap.get(parentId)[TEST_TIME_LOGGED] -
                                        storyMetricsMap.get(parentId)[TEST_TIME_ESTIMATED])
                                    / storyMetricsMap.get(parentId)[TEST_TIME_ESTIMATED];
                                storyMetricsMap.get(parentId)[AT_DEVIATION] =
                                    (storyMetricsMap.get(parentId)[AT_TIME_LOGGED] -
                                        storyMetricsMap.get(parentId)[AT_TIME_ESTIMATED])
                                    / storyMetricsMap.get(parentId)[AT_TIME_ESTIMATED];
                                storyMetricsMap.get(parentId)[FINDINGS_LOGGED] += timeLogged;

                                storyMetricsMap.get("Summary")[DEV_TIME_ESTIMATED] += (timeEstimate / 2);
                                storyMetricsMap.get("Summary")[DEV_TIME_LOGGED] += (timeLogged / 2);
                                storyMetricsMap.get("Summary")[DEV_TIME_REMAINING] += (timeRemaining / 2);
                                storyMetricsMap.get("Summary")[TEST_TIME_ESTIMATED] += (timeEstimate / 2);
                                storyMetricsMap.get("Summary")[TEST_TIME_LOGGED] += (timeLogged / 2);
                                storyMetricsMap.get("Summary")[TEST_TIME_REMAINING] += (timeRemaining / 2);
                                storyMetricsMap.get("Summary")[AT_TIME_ESTIMATED] += (timeEstimate / 2);
                                storyMetricsMap.get("Summary")[AT_TIME_LOGGED] += (timeLogged / 2);
                                storyMetricsMap.get("Summary")[AT_TIME_REMAINING] += (timeRemaining / 2);
                                storyMetricsMap.get("Summary")[DEV_DEVIATION] =
                                    (storyMetricsMap.get("Summary")[DEV_TIME_LOGGED] -
                                        storyMetricsMap.get("Summary")[DEV_TIME_ESTIMATED])
                                    / storyMetricsMap.get("Summary")[DEV_TIME_ESTIMATED];
                                storyMetricsMap.get("Summary")[TEST_DEVIATION] =
                                    (storyMetricsMap.get("Summary")[TEST_TIME_LOGGED] -
                                        storyMetricsMap.get("Summary")[TEST_TIME_ESTIMATED])
                                    / storyMetricsMap.get("Summary")[TEST_TIME_ESTIMATED];
                                storyMetricsMap.get("Summary")[AT_DEVIATION] =
                                    (storyMetricsMap.get("Summary")[AT_TIME_LOGGED] -
                                        storyMetricsMap.get("Summary")[AT_TIME_ESTIMATED])
                                    / storyMetricsMap.get("Summary")[AT_TIME_ESTIMATED];
                                storyMetricsMap.get("Summary")[FINDINGS_LOGGED] += timeLogged
                            }
                        }
                    }
                });

                $("#sos-story-table-body").html("");
                $("#sos-story-table-foot").html("");
                storyMetricsMap.forEach(self.paintSOSStoryTableRow, this);
                self.paintSOSStorySummaryRow(storyMetricsMap);

                componentHandler.upgradeAllRegistered();

                $('.eos-field').hide();
                $('.sos-field').show();
                $('.non-export-field').show();

                snw_supportAnalyzer["%support"] =  snw_supportAnalyzer["totalOthers"] / (snw_supportAnalyzer["totalUser"] + snw_supportAnalyzer["totalOthers"]) * 100;
                // console.log("SNOW support analyzer", snw_supportAnalyzer);
            },
            enumerable: false
        },

        showError : {
            value: function(data)
            {
                console.log(data);
            },
            enumerable: false
        },

        getSubtaskType : {
            value: function(subtask)
            {
                // This function shall be updated as per project needs. Given a subtask, the function must return "dev", "at" or "test".
                var subtaskSummary = subtask.fields.summary;
                if (subtaskSummary.startsWith("TEST")){
                    return "test";
                } else if (subtaskSummary.startsWith("AT")){
                    return "at";
                } else if (subtaskSummary.startsWith("Finding")) {
                    return "finding";
                } else
                {
                    return "dev";
                }
            },
            enumerable: false
        },
        formatToStringHours : {
            value: function(value)
            {
                var valueRound = value.toFixed(2);
                var valueRoundString = valueRound.toString(2);
                return valueRoundString;
            },
            enumerable: false
        },
        formatToStringPercentage : {
            value: function(value)
            {
                var valuePercentage = (value*100).toFixed(1);
                var valuePercentageString = valuePercentage.toString() + "%";
                return valuePercentageString;
            },
            enumerable: false
        },
        paintSOSStoryTableRow : {
            value: function(value, key, map)
            {
                var rowData;
                // console.log("DEBUG", key, map, this);

                if (key != "Summary") {
                    rowData = $("<tr/>",
                    {
                        id: value[US_KEY],
                        class: "story",
                        html:    "<td class='mdl-data-table__cell--non-numeric non-export-field'> " + value[US_TYPE_ICON] +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> " + value[US_KEY] +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> <span>" + value[US_DESCRIPTION] +"</span></td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> " + value[US_USP] +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringHours(value[DEV_TIME_LOGGED]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringHours(value[DEV_TIME_ESTIMATED]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric sos-field'> " + this.formatToStringHours(value[DEV_TIME_REMAINING]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringHours(value[AT_TIME_LOGGED]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringHours(value[AT_TIME_ESTIMATED]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric sos-field'> " + this.formatToStringHours(value[AT_TIME_REMAINING]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringHours(value[TEST_TIME_LOGGED]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringHours(value[TEST_TIME_ESTIMATED]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric sos-field'> " + this.formatToStringHours(value[TEST_TIME_REMAINING]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringPercentage(value[DEV_DEVIATION]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringPercentage(value[AT_DEVIATION]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringPercentage(value[TEST_DEVIATION]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringHours(value[FINDINGS_LOGGED]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric non-export-field'> " + value[US_STATUS_ICON] + "</td>"
                    });
                    rowData.appendTo($("#sos-story-table-body"));
                }
            },
            enumerable: false
        },
        paintSOSStorySummaryRow : {
            value: function(map)
            {
                var value = map.get("Summary");
                var rowData = $("<tr/>",
                    {
                        id: "sprint-sos-summary",
                        class: "summary-row",
                        html:    "<td class='mdl-data-table__cell--non-numeric '> TOTALS: </td>" +
                            "<td class='mdl-data-table__cell--non-numeric non-export-field'> </td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> </td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> </td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringHours(value[DEV_TIME_LOGGED]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringHours(value[DEV_TIME_ESTIMATED]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric sos-field'> " + this.formatToStringHours(value[DEV_TIME_REMAINING]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringHours(value[AT_TIME_LOGGED]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringHours(value[AT_TIME_ESTIMATED]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric sos-field'> " + this.formatToStringHours(value[AT_TIME_REMAINING]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringHours(value[TEST_TIME_LOGGED]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringHours(value[TEST_TIME_ESTIMATED]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric sos-field'> " + this.formatToStringHours(value[TEST_TIME_REMAINING]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringPercentage(value[DEV_DEVIATION]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringPercentage(value[AT_DEVIATION]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringPercentage(value[TEST_DEVIATION]) +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric eos-field'> " + this.formatToStringHours(value[FINDINGS_LOGGED]) +"</td>" +
                            "<td class='non-export-field'></td>"
                    });
                rowData.appendTo($("#sos-story-table-foot"));
            },
            enumerable: false
        },
    });

    views.MetricsView = MetricsView;
})(viewer.views);
