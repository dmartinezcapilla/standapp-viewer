(function (views) {
  let self;

  function WorkView(presenter) {
    this.presenter = presenter;
  }

  Object.defineProperties(WorkView.prototype, {
    init: {
      value: function () {
        var self = this;

        $("#start_standup")
            .off("click")
            .on("click", function () {
              $("#standup").addClass("running");
              $("#stop_standup").show();
              $("#next_standup").show();
              $("#pause_standup").show();
              $("#previous_standup").hide();
              $("#countdown").show();
              $("#right_panel").show();
              $(".clock-container").show();
              $("#right_panel ul.users > li:first-child").css({
                marginLeft: "131px",
              });
              $("#localVideo").show();
              $(this).hide();

              self.nextUser();
            });

        $("#previous_standup")
            .off("click")
            .on("click", function () {
              self.previousUser();
            });

        $("#next_standup")
            .off("click")
            .on("click", function () {
              self.nextUser();
            });

        $("#pause_standup")
            .off("click")
            .on("click", function () {
              if ($("#standup").hasClass("paused")) {
                chart_is_running = true;
                $("#standup").removeClass("paused");
                $(this).children().html("pause");
                showActionButtons();
              } else {
                chart_is_running = false;
                $("#standup").addClass("paused");
                $(this).children().html("play_arrow");

                hideActionButtons(false);
              }
            });

        $("#stop_standup")
            .off("click")
            .on("click", function () {
              self.stop();
            });

        showDigitalClock();

        $("#right_panel > .date").html(moment().format("dddd, D MMMM"));

        $("#right_panel ul.users").kinetic({ cursor: "auto" });

        chart_element = new Chart(
            document.getElementById('time_chart'),
            config_chart_js
        );

        setInterval(() => {
          updateTimeChart();
          if (chart_is_running && elapsed_seconds === max_seconds_in_chart) {
            chart_is_running = false;
            setTimeChart(0);
            self.nextUser();
          }
        }, 100); // Increment elapsed time every second
      },
      enumerable: false,
    },

    stop: {
      value: function () {
        if ($("#standup").hasClass("paused")) {
          $("#standup").removeClass("paused");
          $("#pause_standup").children().html("pause");
        }

        $("#standup").removeClass("running");
        $("#pause_standup").hide();
        $("#countdown").hide();
        $("#stop_standup").hide();
        $("#previous_standup").hide();
        $("#next_standup").hide();
        $("#right_panel").hide();
        $(".clock-container").hide();
        $("#start_standup").show();
        $("#start_randomize_facilitator").show();
        $("#localVideo").hide();

        $("#right_panel ul.users").children().removeClass("completed");

        $("#countdown .text").html("");

        $(".worklog").hide();
      },
      enumerable: false,
    },
    previousUser: {
      value: function () {
        var self = this;
        var length = $("#right_panel ul.users").children(".completed").length;
        let prev = undefined;
        let current = prev = $("#right_panel ul.users")
            .children(".completed").eq(length - 1);
        if(length > 1) {
          prev = $("#right_panel ul.users")
              .children(".completed").eq(length - 2);
        }

        if (prev!==undefined) {

          $(".worklog").hide();

          $("#right_panel ul.users")
              .children(".completed")
              .children("img")
              .css({ width: "32px", height: "32px", "border-radius": "16px" });

          $("#right_panel ul.users li:first-child").animate(
              { marginLeft: "+=62px" },
              600,
              "swing",
              function () {
                current.removeClass("completed");
              },
          );

          prev
              .children("img")
              .animate(
                  { width: "48px", height: "48px", "border-radius": "24px" },
                  600,
              );

          showUserName(prev.attr("data-name"));

          hideActionButtons(true);

          prev.children(".worklog").show();

          if (prev.children(".worklog").data("pie")) {
            prev.children(".worklog").data("pie").show();
          }

          //Start chart
          startWorkingTime();

        } else {
          self.stop();
        }
      },
      enumerable: false,
    },
    nextUser: {
      value: function () {
        var self = this;

        var next = $("#right_panel ul.users")
            .children(":not(.completed)")
            .first();

        if (next.length) {
          $(".worklog").hide();

          $("#right_panel ul.users")
              .children(".completed")
              .children("img")
              .css({ width: "32px", height: "32px", "border-radius": "16px" });

          $("#right_panel ul.users li:first-child").animate(
              { marginLeft: "-=62px" },
              600,
              "swing",
              function () {
                next.addClass("completed");
              },
          );

          next
              .children("img")
              .animate(
                  { width: "48px", height: "48px", "border-radius": "24px" },
                  600,
              );

          showUserName(next.attr("data-name"));

          hideActionButtons(true);

          next.children(".worklog").show();

          if (next.children(".worklog").data("pie")) {
            next.children(".worklog").data("pie").show();
          }

          //Start chart
          startWorkingTime();

        } else {
          self.stop();
        }
      },
      enumerable: false,
    },
    createUser: {
      value: function (user) {
        var userKey = user.key.replace(/\./g, "_");

        var element = $("#" + userKey + "_user");

        if (element.length === 0) {
          element = $("<li/>", {
            id: userKey + "_user",
            "data-name": user.displayName,
            "data-user": user.key,
          });

          var worklog = $("<div/>", { class: "worklog" }).appendTo(element);

          var pie = new viewer.helpers.WorkPieChart(user.key);
          pie.init(worklog);

          $("<img/>", { src: user.avatarUrls["48x48"] }).appendTo(element);

          if (g_dev_users.indexOf(user.key) > -1) {
            element.prependTo($("#right_panel .users"));
          } else {
            element.appendTo($("#right_panel .users"));
          }
        }

        return element;
      },
      enumerable: false,
    },
    load: {
      value: function (boardId, data) {
        var self = this;

        $("#right_panel ul.users").html("");

        $.each(data.issues, function (key, issue) {
          if (issue.fields.assignee) {
            var user = self.createUser(issue.fields.assignee);

            var status = g_status_map[issue.fields.status.id];

            if (!issue.fields.worklog.worklogs.length) {
              if (status !== "rejected") {
                user
                    .children(".worklog")
                    .data("pie")
                    .addWorkLog(issue, new Date(), 0);
              } else {
                user
                    .children(".worklog")
                    .data("pie")
                    .addWorkLog(issue, issue.fields.updated, 0);
              }
            }
          }

          $.each(issue.fields.worklog.worklogs, function (key2, worklog) {
            var user = self.createUser(worklog.author);
            user
                .children(".worklog")
                .data("pie")
                .addWorkLog(issue, worklog.created, worklog.timeSpentSeconds);
          });
        });
      },
      enumerable: false,
    },

    showError: {
      value: function (data) {
        console.log(data);
      },
      enumerable: false,
    },
  });

  views.WorkView = WorkView;
})(viewer.views);
