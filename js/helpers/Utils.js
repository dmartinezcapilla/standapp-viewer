$.xhrPool = [];
$.xhrPool.abortAll = function() {
    $(this).each(function(idx, jqXHR) {
        jqXHR.abort();
    });
};

$.ajaxSetup({
    complete: function(jqXHR) {
        var index = $.xhrPool.indexOf(jqXHR);
        if (index > -1) {
            $.xhrPool.splice(index, 1);
        }
    }
});

$(document).ready(function ()
{             
    $("#toolbar-window .close").click(function()
    {
       window.close();   
    });
    
    $("#toolbar-window .minimize").click(function()
    {
       window.minimize();   
    });
    
    $("#toolbar-window .maximize").click(function()
    {
       window.maximize();   
    });
});

function round(value, numDec)
{
    var dec = Math.pow(10, numDec);
    return Math.round(value * dec) / dec;
}

function showDigitalClock()
{
    var date = new Date();
    var h = date.getHours(); // 0 - 23
    var m = date.getMinutes(); // 0 - 59
    var s = date.getSeconds(); // 0 - 59
    
    h = (h < 10) ? "0" + h : h;
    m = (m < 10) ? "0" + m : m;
    s = (s < 10) ? "0" + s : s;
    
    var time = h + ":" + m;
    
    document.getElementById("clockNow").innerText = time;
    document.getElementById("clockNow").textContent = time;
    document.getElementById("clockNow2").innerText = time;
    document.getElementById("clockNow2").textContent = time;
    
    setTimeout(showDigitalClock, 1000);
}

function initLocalClocks()
{
  var date = new Date;
  var seconds = date.getSeconds();
  var minutes = date.getMinutes();
  var hours = date.getHours();

  var hands = [
    {
      hand: 'hours',
      angle: (hours * 30) + (minutes / 2)
    },
    {
      hand: 'minutes',
      angle: (minutes * 6)
    },
    {
      hand: 'seconds',
      angle: (seconds * 6)
    }
  ];

  for (var j = 0; j < hands.length; j++) {
    var elements = document.querySelectorAll('.local .' + hands[j].hand);
    for (var k = 0; k < elements.length; k++) {
        elements[k].style.transform = 'rotateZ('+ hands[j].angle +'deg)';
        // If this is a minute hand, note the seconds position (to calculate minute position later)
        if (hands[j].hand === 'minutes') {
          elements[k].parentNode.setAttribute('data-second-angle', hands[j + 1].angle);
        }
    }
  }
}

function moveSecondHands()
{
  var containers = document.querySelectorAll('.bounce .seconds-container');
  setInterval(function() {
    for (var i = 0; i < containers.length; i++) {
      if (containers[i].angle === undefined) {
        containers[i].angle = 6;
      } else {
        containers[i].angle += 6;
      }
      containers[i].style.webkitTransform = 'rotateZ('+ containers[i].angle +'deg)';
      containers[i].style.transform = 'rotateZ('+ containers[i].angle +'deg)';
    }
  }, 1000);
  for (var i = 0; i < containers.length; i++) {
    // Add in a little delay to make them feel more natural
    var randomOffset = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
    containers[i].style.transitionDelay = '0.0'+ randomOffset +'s';
  }
}

function setUpMinuteHands()
{
  // More tricky, this needs to move the minute hand when the second hand hits zero
  var containers = document.querySelectorAll('.minutes-container');
  var secondAngle = containers[containers.length - 1].getAttribute('data-second-angle');

  if (secondAngle > 0)
  {
    // Set a timeout until the end of the current minute, to move the hand
    var delay = (((360 - secondAngle) / 6) + 0.1) * 1000;

    setTimeout(function() {
      moveMinuteHands(containers);
    }, delay);
  }
}

function moveMinuteHands(containers)
{
  for (var i = 0; i < containers.length; i++) {
    containers[i].style.webkitTransform = 'rotateZ(6deg)';
    containers[i].style.transform = 'rotateZ(6deg)';
  }
  // Then continue with a 60 second interval
  setInterval(function() {
    for (var i = 0; i < containers.length; i++) {
      if (containers[i].angle === undefined) {
        containers[i].angle = 12;
      } else {
        containers[i].angle += 6;
      }
      containers[i].style.webkitTransform = 'rotateZ('+ containers[i].angle +'deg)';
      containers[i].style.transform = 'rotateZ('+ containers[i].angle +'deg)';
    }
  }, 60000);
}

function setAppVersion(version)
{
    
}

function base64Encode(str)
{
    var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out = "", i = 0, len = str.length, c1, c2, c3;
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
            out += CHARS.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += CHARS.charAt(c3 & 0x3F);
    }
    return out;
}

// Initialize chart data labels
Chart.register(ChartDataLabels);

// Work View methods
// Function to update the elapsed time on the chart
function updateTimeChart() {
    if (chart_is_running && elapsed_seconds < max_seconds_in_chart) {
        elapsed_seconds++;
        setTimeChart(elapsed_seconds);
    }
}

function setTimeChart(seconds) {
    chart_element.data.datasets[0].data[0] = max_seconds_in_chart - seconds;
    chart_element.data.datasets[0].data[1] = seconds;
    chart_element.update();
    let time_to_present = Math.floor((max_seconds_in_chart - seconds) / 10);
    $("#countdown .text").html(time_to_present);
}

function showUserName(userName) {
    if (userName.indexOf(" ") > -1) {
        userName = userName.substring(0, userName.indexOf(" "));
    }

    $("#countdown .user").html(userName);
}

function hideActionButtons(hidePauseAction) {
    $("#previous_standup").hide();
    $("#next_standup").hide();
    if (hidePauseAction) {
        $("#pause_standup").hide();
    }
}

function showActionButtons() {
    if ($("#right_panel ul.users")
        .children(".completed")
        .length > 1) {
        $("#previous_standup").show();
    }
    $("#next_standup").show();
    $("#pause_standup").show();
}

function startWorkingTime() {
    elapsed_seconds = 0;
    chart_is_running = true;
    setTimeout(() => {
        showActionButtons();
    }, 700);
}


// Task View - Decompose title task
function decomposeTitleTask(title) {
    var status = undefined;
    var owner = undefined;
    var titleParts = title.match(/^\(([A-Z \d\W]+)\)(.*)/);
    if (titleParts!==null) {
        status = titleParts[1].trim();
        title = titleParts[2].trim();
    }
    titleParts = title.match(/([A-Z \d\W]+):(.*)/);
    if (titleParts!==null) {
        owner = titleParts[1].trim();
        title = titleParts[2].trim();
    } else {
        titleParts = title.match(/(.*):(.*)/);
        if (titleParts!==null) {
            owner = titleParts[1].trim();
            title = titleParts[2].trim();
        }
    }
    var ownerLabel = '';
    if (owner !== undefined) {
        var ownerColor = '';
        if(owner.substring(0,3).toLowerCase()==='dev') {
            ownerColor = ' dev';
        }
        if(owner.substring(0,4).toLowerCase()==='test') {
            ownerColor = ' test';
        }
        if(owner.substring(0,2).toLowerCase()==='at') {
            ownerColor = ' at';
        }
        if(owner.substring(0,7).toLowerCase()==='finding') {
            ownerColor = ' finding';
        }
        ownerLabel = `<span class="owner${ownerColor}">${owner}</span>`;
    }
    var statusLabel = '';
    if (status !== undefined) {
        var greenStatus = '';
        if (status==='CLOSED' || status === 'REVIEWED') {
            greenStatus = ' gr-task';
        }
        statusLabel = `<span class="status-task${greenStatus}">${status}</span>`;
    }

    return {
        title : title,
        ownerLabel : ownerLabel,
        statusLabel : statusLabel
    };
}
