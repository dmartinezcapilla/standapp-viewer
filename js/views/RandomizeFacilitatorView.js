(function (views) {
  var self;

  function RandomizeFacilitatorView(presenter) {
    this.presenter = presenter;
    this.wheelSpinning = false;
    this.wheelPower = 2;
  }

  Object.defineProperties(RandomizeFacilitatorView.prototype, {
    init: {
      value: function () {
        var self = this;

        $("#start_randomize_facilitator")
          .off("click")
          .on("click", function () {
            $("#randomize-facilitator").show();
            $("#randomize-facilitator").addClass("running");
            $("#close-randomize-facilitator-button").show();
          });

        $("#close-randomize-facilitator-button").click(function () {
          $("#randomize-facilitator").hide();
          $("#randomize-facilitator").removeClass("running");
          $("#close-randomize-facilitator-button").hide();
        });

        $("#winner-container").hide();
      },
      enumerable: false,
    },

    load: {
      value: function (data) {
        var self = this;
        self.usersMap = new Map();
        var segments = [];
        var colors = [
          "#1abc9c",
          "#f1c40f",
          "#f39c12",
          "#27ae50",
          "#3498db",
          "#e74c3c",
          "#9b59b6",
          "#c0392b",
          "#d35400",
          "#2980b9",
        ];

        $.each(data.issues, function (key, issue) {
          if (issue.fields.assignee && issue.fields.assignee.name) {
            var displayName = issue.fields.assignee.displayName;

            if (!self.usersMap.has(displayName)) {
              self.usersMap.set(
                displayName,
                issue.fields.assignee.avatarUrls["48x48"],
              );
              segments.push({
                fillStyle: colors[(segments.length - 1) % 10],
                text: displayName,
              });
            }
          }
        });

        componentHandler.upgradeAllRegistered();

        self.theWheel = new Winwheel({
          numSegments: self.usersMap.size, // Specify number of segments.
          outerRadius: 300, // Set outer radius so wheel fits inside the background.
          textFontSize: 22, // Set font size as desired.
          segments: segments,
          // Specify the animation to use.
          animation: {
            type: "spinToStop",
            duration: 5, // Duration in seconds.
            spins: self.usersMap.size, // Number of complete spins.
            callbackFinished: this.alertPrize.bind(this),
          },
        });

        $("#start-spin-button").click(function () {
          // Ensure that spinning can't be clicked again while already running.
          if (self.wheelSpinning == false) {
            // Based on the power level selected adjust the number of spins for the wheel, the more times is has
            // to rotate with the duration of the animation the quicker the wheel spins.
            if (self.wheelPower == 1) {
              self.theWheel.animation.spins = 3;
            } else if (self.wheelPower == 2) {
              self.theWheel.animation.spins = 8;
            } else if (self.wheelPower == 3) {
              self.theWheel.animation.spins = 15;
            }

            // Begin the spin animation by calling startAnimation on the wheel object.
            self.theWheel.startAnimation();

            // Set to true so that power can't be changed and spin button re-enabled during
            // the current animation. The user will have to reset before spinning again.
            self.wheelSpinning = true;
            $("#start-spin-button").hide();
            $("#reset-spin-button").show();
          }
        });

        $("#reset-spin-button").click(function () {
          self.theWheel.stopAnimation(false); // Stop the animation, false as param so does not call callback function.
          self.theWheel.rotationAngle = 0; // Re-set the wheel angle to 0 degrees.
          self.theWheel.draw(); // Call draw to render changes to the wheel.

          self.wheelSpinning = false;

          $("#start-spin-button").show();
          $("#reset-spin-button").hide();
          $("#winner-container").hide();
        });

        // console.log("USERs map", self.usersMap);
      },
      enumerable: false,
    },

    showError: {
      value: function (data) {
        console.log(data);
      },
      enumerable: false,
    },

    alertPrize: {
      value: function () {
        var self = this;
        // Get the segment indicated by the pointer on the wheel background which is at 0 degrees.
        var winningSegment = this.theWheel.getIndicatedSegment();

        // Do basic alert of the segment text. You would probably want to do something more interesting with this information.
        // alert(winningSegment.text + ' is the employee of the day!');

        $("#winner-container").show();
        $("#winner-image").html("");
        $("<img/>", {
          src: self.usersMap.get(winningSegment.text),
          height: "100px",
          width: "100px",
        }).appendTo($("#winner-image"));
        $("#winner-text").html(
          winningSegment.text + ", <br> today is your day!",
        );
      },
      enumerable: false,
    },
  });

  views.RandomizeFacilitatorView = RandomizeFacilitatorView;
})(viewer.views);
