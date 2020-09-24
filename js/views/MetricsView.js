(function(views)
{
    var self;

    const US_DESCRIPTION = 0;
    const US_TYPE = 1;
    const US_TYPE_ICON = 2;
    const US_STATUS = 3;
    const US_STATUS_ICON = 4;
    const DEV_TIME_ESTIMATED = 5;
    const DEV_TIME_LOGGED = 6;
    const DEV_TIME_REMAINING = 7;
    const AT_TIME_ESTIMATED = 8;
    const AT_TIME_LOGGED = 9;
    const AT_TIME_REMAINING = 10;
    const TEST_TIME_ESTIMATED = 11;
    const TEST_TIME_LOGGED = 12;
    const TEST_TIME_REMAINING = 13;


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
            },
            enumerable: false
        },

        load : {
            value: function(data)
            {
                var self = this;
                var storyMetricsMap = new Map();

                var initialRowValues = [];
                initialRowValues[US_DESCRIPTION] = "TOTALS";
                initialRowValues[US_TYPE] ="";
                initialRowValues[US_TYPE_ICON] = "";
                initialRowValues[US_STATUS] = "";
                initialRowValues[US_STATUS_ICON] = "";
                initialRowValues[DEV_TIME_ESTIMATED] = 0;
                initialRowValues[DEV_TIME_LOGGED] = 0;
                initialRowValues[DEV_TIME_REMAINING] = 0;
                initialRowValues[AT_TIME_ESTIMATED] = 0;
                initialRowValues[AT_TIME_LOGGED] = 0;
                initialRowValues[AT_TIME_REMAINING] = 0;
                initialRowValues[TEST_TIME_ESTIMATED] = 0;
                initialRowValues[TEST_TIME_LOGGED] = 0;
                initialRowValues[TEST_TIME_REMAINING] = 0;
                storyMetricsMap.set("Summary", initialRowValues);


                $.each( data.issues, function( key, issue )
                {
                    var issueTypeUserStory = g_issuetype_map.user_story[issue.fields.issuetype.id];

                    if(issueTypeUserStory != undefined)
                    {
                        var storyInitialRowValues = [];
                        storyInitialRowValues[US_DESCRIPTION] =issue.fields.summary;
                        storyInitialRowValues[US_TYPE] =issueTypeUserStory;
                        storyInitialRowValues[US_TYPE_ICON] = "<img class=\"issuetype\" src=\"" + issue.fields.issuetype.iconUrl + "\"/>";
                        storyInitialRowValues[US_STATUS] = "";
                        storyInitialRowValues[US_STATUS_ICON] = "<img class=\"statusicon\" src=\"" + issue.fields.status.iconUrl + "\"/>";
                        storyInitialRowValues[US_STATUS] = issue.fields.status;
                        storyInitialRowValues[DEV_TIME_ESTIMATED] = 0;
                        storyInitialRowValues[DEV_TIME_LOGGED] = 0;
                        storyInitialRowValues[DEV_TIME_REMAINING] = 0;
                        storyInitialRowValues[AT_TIME_ESTIMATED] = 0;
                        storyInitialRowValues[AT_TIME_LOGGED] = 0;
                        storyInitialRowValues[AT_TIME_REMAINING] = 0;
                        storyInitialRowValues[TEST_TIME_ESTIMATED] = 0;
                        storyInitialRowValues[TEST_TIME_LOGGED] = 0;
                        storyInitialRowValues[TEST_TIME_REMAINING] = 0;

                        storyMetricsMap.set(issue.key, storyInitialRowValues);

                        // console.log("issue:", issue);
                    }
                    else {
                        var subtask = issue;
                        var parentKey = subtask.fields.parent.key;

                        // console.log("issue:", issue);

                        var timeRemaining = 0;
                        if (issue.fields.timetracking.remainingEstimateSeconds) {
                            timeRemaining+= issue.fields.timetracking.remainingEstimateSeconds/3600;
                        }

                        var remTimeColIndex = -1;
                        if (self.getSubtaskType(subtask) == "dev")
                        {
                            remTimeColIndex = DEV_TIME_REMAINING;
                        }
                        else if (self.getSubtaskType(subtask) == "at")
                        {
                            remTimeColIndex = AT_TIME_REMAINING;
                        }
                        else if (self.getSubtaskType(subtask) == "test") {
                            remTimeColIndex = TEST_TIME_REMAINING;
                        }
                        storyMetricsMap.get(parentKey)[remTimeColIndex]+= timeRemaining;
                        storyMetricsMap.get("Summary")[remTimeColIndex]+= timeRemaining;
                    }
                });

                $("#sos-story-table-body").html("");
                $("#sos-story-table-foot").html("");
                storyMetricsMap.forEach(self.paintSOSStoryTableRow);
                self.paintSOSStorySummaryRow(storyMetricsMap);

                componentHandler.upgradeAllRegistered();
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
                } else {
                    return "dev";
                }
            },
            enumerable: false
        },
        paintSOSStoryTableRow : {
            value: function(value, key, map)
            {
                var rowData;
                if (key != "Summary") {
                    rowData = $("<tr/>",
                    {
                        id: key,
                        class: "story",
                        html:    "<td class='mdl-data-table__cell--non-numeric '> " + value[US_TYPE_ICON] +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> " + key +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> " + value[US_DESCRIPTION] +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> " + value[DEV_TIME_REMAINING] +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> " + value[AT_TIME_REMAINING] +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> " + value[TEST_TIME_REMAINING] +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> " + value[US_STATUS_ICON] + "</td>"
                    });
                    rowData.appendTo($("#sos-story-table-body"));
                }
            },
            enumerable: false
        },
        paintSOSStorySummaryRow : {
            value: function(map)
            {
                var self = this;
                var value = map.get("Summary");
                var rowData = $("<tr/>",
                    {
                        id: "sprint-sos-summary",
                        class: "summary-row",
                        html:    "<td class='mdl-data-table__cell--non-numeric '> TOTALS: </td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> </td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> </td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> " + value[DEV_TIME_REMAINING] +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> " + value[AT_TIME_REMAINING] +"</td>" +
                            "<td class='mdl-data-table__cell--non-numeric'> " + value[TEST_TIME_REMAINING] +"</td>" +
                            "<td class='hiddenField'><span class='mdl-chip__contact "+"green"+" mdl-color-text--white'></span></td>"
                    });
                rowData.appendTo($("#sos-story-table-foot"));
            },
            enumerable: false
        },
    });

    views.MetricsView = MetricsView;
})(viewer.views);
