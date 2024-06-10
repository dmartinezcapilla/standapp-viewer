(function (helpers) {
  var self;

  function WorkPieChart(user) {
    this.user = user;
    this.worklog = 0;

    this.colors = [
      "#2196F3",
      "#E91E63",
      "#8BC34A",
      "#673AB7",
      "#FF5722",
      "#FFC107",
      "#F44336",
      "#009688",
      "#4CAF50",
      "#9C27B0",
      "#CDDC39",
      "#FFEB3B",
      "#FF9800",
      "#FF5722",
      "#795548",
      "#607D8B",
    ];
  }

  Object.defineProperties(WorkPieChart.prototype, {
    init: {
      value: function (worklog) {
        self = this;

        this.tasks_container = $("<div/>", { class: "tasks" })
          .kinetic({ cursor: "auto" })
          .appendTo(worklog);
        this.pies_container = $("<div/>", { class: "pies" }).appendTo(worklog);

        this.issues = [];

        worklog.data("pie", this);
      },
      enumerable: false,
    },
    createPieChart: {
      value: function (parent, title, data) {
        self = this;
        data.datasets.forEach((dataset) => {
          dataset.data.forEach((d) => {
            self.worklog = self.worklog + d;
          });
        });

        $("#input-worklog > p").html(`${self.worklog} h`);
        if (self.worklog < 7.5) {
          $("#sad-emoji").css("display", "block");
        } else {
          $("#sad-emoji").css("display", "none");
        }
        parent.children("canvas").remove();
        var canvas = $("<canvas/>").appendTo(parent);

        // Configuration options
        const config= {
          type: 'pie',
          data: data,
          options: options_story_work_chart,
        };
        return new Chart(canvas, config);
      },
      enumerable: false,
    },
    createBarChart: {
      value: function (parent, data) {
        parent.children("canvas").remove();
        var canvas = $("<canvas/>").appendTo(parent);

        var maxScaleX = Math.max(
          data.datasets[0].data[0],
          data.datasets[1].data[0] + data.datasets[2].data[0],
        );

        // console.log("data chart bar");
        // console.log(data);

        const config= {
          type: 'bar',
          data: data,
          options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              datalabels: {
                display: function(context) {
                  return context.dataset.data[context.dataIndex] > 0;
                },
                formatter: function(value, context) {
                  return value + 'h';
                },
                color: 'white',
                anchor: 'center',
                align: 'center',
              },
              legend: {
                display: false
              },
              tooltip: {
                enabled: false // Disable tooltips
              },
              hover: {
                mode: null // Disable hover effects
              },
            },
            scales: {
              x: {
                display: false
              },
              y: {
                display: false
              }
            },
          },
        };
        return new Chart(canvas, config);
      },
      enumerable: false,
    },
    addWorkLog: {
      value: function (issue, created, seconds) {
        created = moment(created);

        var today = moment().startOf("day");

        if (
          !created.isSame(today, "d") &&
          (this.lastDay == undefined ||
            this.lastDay.diff(created) < 0 ||
            created.isSame(this.lastDay, "d"))
        ) {
          this.lastDay = created;
        }

        this.append(created, issue, seconds);
      },
      enumerable: false,
    },
    append: {
      value: function (date, issue, seconds) {
        date = date.format("YYYY-MM-DD");

        if (this.issues[issue.key] == undefined) {
          this.issues[issue.key] = { issue: issue, dates: [] };
        }

        if (this.issues[issue.key].dates[date] == undefined) {
          this.issues[issue.key].dates[date] = { seconds: 0 };
        }

        this.issues[issue.key].dates[date].seconds += seconds / 3600;
      },
      enumerable: false,
    },
    renderPie: {
      value: function (parent, container, today, lastDay) {
        var data = {
          labels: [],
          datasets: [
            {
              backgroundColor: [],
              data: [],
            },
          ],
        };

        var i = 0;
        for (var key in this.issues) {
          var element = this.issues[key];

          if (
            element.issue.fields.parent != undefined &&
            element.issue.fields.parent.key == parent &&
            (element.dates[today.format("YYYY-MM-DD")] != undefined ||
              element.dates[lastDay.format("YYYY-MM-DD")] != undefined)
          ) {
            data.labels.push(element.issue.key);
            data.datasets[0].backgroundColor.push(this.colors[i]);
            data.datasets[0].data.push(0);

            if (lastDay != undefined) {
              var lastDayElement = element.dates[lastDay.format("YYYY-MM-DD")];
              if (lastDayElement != undefined) {
                data.datasets[0].data[data.datasets[0].data.length - 1] +=
                  round(lastDayElement.seconds, 2);
              }
            }
            var todayElement = element.dates[today.format("YYYY-MM-DD")];
            if (todayElement != undefined) {
              data.datasets[0].data[data.datasets[0].data.length - 1] += round(
                todayElement.seconds,
                2,
              );
            }

            ++i;
          }
        }

        this.createPieChart(container, "Logged work", data);
      },
      enumerable: false,
    },
    renderBar: {
      value: function (issue, container) {
        var barChartData = {
          labels: [],
          datasets: [
            {
              label: "Original",
              backgroundColor: "#89AFD7",
              stack: "Stack 0",
              data: [],
            },
            {
              label: "Logged",
              backgroundColor: "#51A825",
              stack: "Stack 1",
              data: [],
            },
            {
              label: "Remaining",
              backgroundColor: "#EC8E00",
              stack: "Stack 1",
              data: [],
            },
          ],
        };

        var original =
          (issue.fields.timetracking.originalEstimateSeconds || 0) / 3600;
        var remaining =
          (issue.fields.timetracking.remainingEstimateSeconds || 0) / 3600;
        var logged = (issue.fields.timetracking.timeSpentSeconds || 0) / 3600;

        barChartData.labels.push(issue.key);
        barChartData.datasets[0].data.push(Math.ceil(original));
        barChartData.datasets[1].data.push(Math.ceil(logged));
        barChartData.datasets[2].data.push(Math.ceil(remaining));

        return this.createBarChart(container, barChartData);
      },
      enumerable: false,
    },
    renderInfo: {
      value: function (parent, container, today, lastDay) {
        var i = 0;
        for (var key in this.issues) {
          var element = this.issues[key];

          if (
            element.issue.fields.parent != undefined &&
            element.issue.fields.parent.key == parent &&
            (element.dates[today.format("YYYY-MM-DD")] != undefined ||
              element.dates[lastDay.format("YYYY-MM-DD")] != undefined)
          ) {
            var base = $("#" + element.issue.key).clone();

            if (base.length > 0) {
              if (
                element.issue.fields.assignee == undefined ||
                this.user != element.issue.fields.assignee.key
              ) {
                base.addClass("not_assigned_to_me");
              }

              var legend_container = $("<div/>");
              var legend = $("<div/>", {
                class: "legend",
                style: "background-color: " + this.colors[i],
              });

              legend.appendTo(legend_container);

              base.find(".progress").remove();

              var progress = $("<div/>", { class: "progress" });
              progress.appendTo(base);

              var task_container = $("<div/>");

              legend_container.appendTo(task_container);
              base.appendTo(task_container);

              task_container.appendTo(container);

              this.renderBar(element.issue, progress);
            }

            i++;
          }
        }
      },
      enumerable: false,
    },
    renderTasks: {
      value: function (today, lastDay) {
        this.tasks_container.html("");
        var container = $("<ul/>").appendTo(this.tasks_container);

        for (var key in this.issues) {
          var element = this.issues[key];

          if (
            element.dates[today.format("YYYY-MM-DD")] != undefined ||
            element.dates[lastDay.format("YYYY-MM-DD")] != undefined
          ) {
            if (element.issue.fields.parent != undefined) {
              var us = container.find("li." + element.issue.fields.parent.key);

              if (us.length == 0) {
                var card = $("<div/>", {
                  class: "demo-card-wide mdl-card mdl-shadow--2dp",
                });

                var usCard = card.clone();

                us = $("<li/>", {
                  class: element.issue.fields.parent.key,
                }).appendTo(container);

                var base = $("#" + element.issue.fields.parent.key);

                if (base.length != 0) {
                  var clone = base.children("li.user_story").clone();

                  clone.appendTo(usCard);

                  clone = base
                    .children("li.todo")
                    .clone()
                    .kinetic({ cursor: "auto" });

                  var usertype = "";

                  if (g_dev_users.indexOf(this.user) > -1) {
                    clone.children("li.qa").remove();
                    usertype = "dev";
                  }

                  if (g_qa_users.indexOf(this.user) > -1) {
                    clone.children("li.dev").remove();
                    usertype = "qa";
                  }

                  if (clone.children("li").length == 0) {
                    clone.append(
                      "<span class='info'>No pending " +
                        usertype +
                        " work</span>",
                    );
                  }

                  clone.appendTo(usCard);
                }

                usCard.appendTo(us);

                //work

                var workCard = card.clone();
                workCard.addClass("work");
                workCard.appendTo(us);

                this.renderPie(
                  element.issue.fields.parent.key,
                  workCard,
                  moment().startOf("day"),
                  this.lastDay,
                );

                //info
                var infoCard = card.clone().kinetic({ cursor: "auto" });
                infoCard.addClass("info");
                infoCard.appendTo(us);

                this.renderInfo(
                  element.issue.fields.parent.key,
                  infoCard,
                  moment().startOf("day"),
                  this.lastDay,
                );
              }
            }
          }
        }
      },
      enumerable: false,
    },
    show: {
      value: function (data) {
        this.worklog = 0;
        this.renderTasks(moment().startOf("day"), this.lastDay);
      },
      enumerable: false,
    },
  });

  helpers.WorkPieChart = WorkPieChart;
})(viewer.helpers);
