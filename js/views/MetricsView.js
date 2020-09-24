(function(views)
{
    var self;

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
                    $("#scrum-helper").addClass("running");
                    $("#close-scrum-helper-button").show();
                });

                $("#close-scrum-helper-button").click(function()
                {
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


                $.each( data.issues, function( key, issue )
                {
                    var issueTypeUserStory = g_issuetype_map.user_story[issue.fields.issuetype.id];

                    if(issueTypeUserStory != undefined)
                    {
                        // console.log("Story: ", issue.fields.summary);
                        //self.storyMetricsDev[issue.key] = 0;//{"metrics": {"dev": 0, "at": 0, "test": 0}};
                        //console.log("DataForMetrics", issue.key, issue.fields.subtasks);

                        storyMetricsMap.set(issue.key, [0,0,0,0,0,0]);
                    }
                    else {
                        var subtask = issue;
                        var parentKey = subtask.fields.parent.key;
                        // console.log("Subtask:", issue, parentKey, storyMetricsMap, storyMetricsMap.get(parentKey));

                        // console.log("issue:", issue);

                        var timeRemaining = issue.fields.timetracking.remainingEstimateSeconds / 3600;

                        if (self.getSubtaskType(subtask) == "dev")
                        {
                            storyMetricsMap.get(parentKey)[0]+= timeRemaining;
                            //self.storyMetricsDev[subtask.fields.parent.key]++;
                        }
                        else if (self.getSubtaskType(subtask) == "at")
                        {
                            storyMetricsMap.get(parentKey)[2]+= timeRemaining;
                            //self.storyMetrics[subtask.fields.parent.key].metrics.at++;
                        }
                        else if (self.getSubtaskType(subtask) == "test") {
                            storyMetricsMap.get(parentKey)[4]+= timeRemaining;
                            //self.storyMetrics[subtask.fields.parent.key].metrics.test++;
                        }
                    }


                        /*
                       var parent = $("#" + issue.fields.parent.key);

                       if(parent.length)
                       {
                           var assignee = "";
						   
							if(issue.fields.assignee != undefined)
							{
								assignee =  "<div class='assignee'>" +
											"   <img id=\"" + issue.key + "_avatar\" src='" + issue.fields.assignee.avatarUrls["32x32"] + "'>" +
											"   <div class=\"mdl-tooltip\" data-mdl-for=\"" + issue.key + "_avatar\">" + issue.fields.assignee.name + "</div>" +
											"</div>";
							}

                            var task = $("<li/>",
                            {
                                id: issue.key, 
                                class: "task " + issueType,
                                html:   assignee +
                                        "<a class='number'>" + issue.key + "</a>" +
                                        "<div class=\"mdl-tooltip\" data-mdl-for=\"" + issue.key + "_link\">" + issue.fields.summary + "</div>" +
                                        "<div id=\"" + issue.key + "_link\" class=\"title\">" + issue.fields.summary + "</div>"
                            });

                            $("<div/>", {class: "progress mdl-progress mdl-js-progress"}).on('mdl-componentupgraded', function() {
                                this.MaterialProgress.setProgress(issue.fields.progress.percent);
                            }).appendTo(task);

                            var status = g_status_map[issue.fields.status.id];

                            if((status == "test" && issueType == "dev") || status == "rejected")
                            {
                                parent.children(".done").append(task);
                            }
                            else
                            {
                                var target = parent.children("." + status);
								
								target.append(task);
								
								if(target.children("li").length > 4 && !target.hasClass("kinetic-active"))
								{
									target.kinetic({cursor: "auto"});
								}
                            }
                       }
                   }*/
                });

                // storyMetricsMap.toString().appendTo("#scrum-helper .content");

                var map = $("<div/>", {class: "summary"}).append(storyMetricsMap.toString());
                map.appendTo($("#scrum-metrics-start"));
                console.log("User Stories: ",storyMetricsMap );

				// $("#loading").hide();
				// $("#start_standup").show();
				
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

        showError : {
            value: function(data)
            {
                console.log(data);
            },
            enumerable: false
        },

        showError : {
            value: function(data)
            {
                console.log(data);
            },
            enumerable: false
        }
    });

    views.MetricsView = MetricsView;
})(viewer.views);
