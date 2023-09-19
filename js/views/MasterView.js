(function (views) {
  var self;

  function MasterView(presenter) {
    this.presenter = presenter;
  }

  Object.defineProperties(MasterView.prototype, {
    init: {
      value: function () {},
      enumerable: false,
    },
    createUser: {
      value: function (user) {
        var element = $("#" + user.key + "_user");

        if (element.length === 0) {
          element = $("<li/>", {
            id: user.key + "_user",
            "data-name": user.displayName,
          });

          $("<div/>", { class: "worklog" }).appendTo(element);

          $("<img/>", { src: user.avatarUrls["48x48"] }).appendTo(element);

          element.appendTo($("#right_panel .users"));
        }

        return element;
      },
      enumerable: false,
    },
    load: {
      value: function (boardId) {
        var user = this.createUser(g_master);

        // /plugins/servlet/gadgets/ifr?container=atlassian&mid=18226&country=US&lang=en&view=default&view-params=%7B%22writable%22%3A%22true%22%7D&st=atlassian%3AkM8RF2C7XN7HyiVIzFVGRAV5bj0XhkMt8uGD17R92xtqiSHkUT6yPaf3Ey5%2FWS8Fq3Tyxw%2F3v1FH%2FJjkux1bzlUyj8mi0nq6jE%2BvmN%2FNQkC7yONLPhnVattusHkcfMtZwUPpgIs2oOAoIDH6%2BsG1GeFC50AGYEc4gX2ibyIeMh2UoN31maaMCCSc3JF0z3ymjOU9lZrK43IRyuJZ%2Fw38s8j811X6Fg2KobDFvUcy8Ywi7zi7XA2Z7laItdb%2F7S6Yc5smnBB9lUs1lttnPvk51mfYeHwUP5QhnUKYOivKH9LbzdgGIIKfrNDvQrVitWPWtkJy5kEQx3SV9kq9noYXWv31V6Cg6O6XvwParPfb%2B%2B%2Fn2IiK&up_isConfigured=true&up_rapidViewId=409&up_showRapidViewName=true&up_sprintId=auto&up_showSprintName=true&up_refresh=15&url=https%3A%2F%2Fjira.ilww.com%3A8443%2Fjira%2Frest%2Fgadgets%2F1.0%2Fg%2Fcom.pyxis.greenhopper.jira%3Agreenhopper-gadget-sprint-burndown%2Fgadgets%2Fgreenhopper-sprint-burndown.xml&libs=auth-refresh#rpctoken=1434342

        //var burndown_path = credentials.server + "/plugins/servlet/gadgets/ifr?container=atlassian&amp;mid=18226&amp;country=US&amp;lang=en&amp;view=default&amp;view-params=%7B%22writable%22%3A%22true%22%7D&amp;st=atlassian%3A5wEyd4QbKlgI%2F3Bn0Y9bHzjvk9MuhhlSKVuZCG5YTJKfm7joXbyjPFcQXbL3O2LeT2zXI378MXY3JScWpX3kdJWQE3QmTqjkgR6zs4%2B6P%2FRJ0qEOtT%2Bf6UoSeqgzkcbh08uxaJKqASFURNuQAfzq49mp%2BWoXqRFUEEwuiHy%2BsCPhwkJ6WR5rB6Wv1KkYy35OHA5X8qoY7cxFszDjwCIQ97oxur3jLqsBuRYGtKntjdGyRc7u4r%2FKYNngJjXp17%2F7Zgfs3uOHmOoxN5PcafOpbrgIvJwSBaVWvX5apxnazY9gsoCotQNl1lYDWWiTa9njSNEgfnOCj4O0QtvNE053xTEIgs7HT0u3uL92LH10NAJPEAnU&amp;up_isConfigured=true&amp;up_rapidViewId="+ boardId +"&amp;up_showRapidViewName=true&amp;up_sprintId=auto&amp;up_showSprintName=true&amp;up_refresh=15&amp;url=https%3A%2F%2Fjira.ilww.com%3A8443%2Fjira%2Frest%2Fgadgets%2F1.0%2Fg%2Fcom.pyxis.greenhopper.jira%3Agreenhopper-gadget-sprint-burndown%2Fgadgets%2Fgreenhopper-sprint-burndown.xml&amp;libs=auth-refresh#rpctoken=7236758";
        /*
				var burndown_path = credentials.server + "/plugins/servlet/gadgets/ifr?country=US&lang=en&view=default&up_isConfigured=true&up_rapidViewId=" + boardId + "&up_showRapidViewName=false&" + 
									"up_sprintId=auto&up_refresh=15&url=" + 
									escape(credentials.server) + 
									"%2Frest%2Fgadgets%2F1.0%2Fg%2Fcom.pyxis.greenhopper.jira%3Agreenhopper-gadget-sprint-burndown%2Fgadgets%2Fgreenhopper-sprint-burndown.xml";

				*/
        var burndown_path =
          credentials.server +
          "/plugins/servlet/gadgets/ifr?country=US&lang=en&view=default&up_isConfigured=true&up_rapidViewId=" +
          boardId +
          "&up_showRapidViewName=false&" +
          "up_sprintId=auto&up_refresh=15&url=" +
          escape(credentials.server) +
          "%2Frest%2Fgadgets%2F1.0%2Fg%2Fcom.pyxis.greenhopper.jira%3Agreenhopper-gadget-sprint-burndown%2Fgadgets%2Fgreenhopper-sprint-burndown.xml";

        console.log("JIRA url", burndown_path);
        // console.log("JIRA beacon", beacon_path);
        var height = Math.min(
          ($("body").width() - $("#right_panel").width()) * 0.5,
          $("body").height() * 0.9,
        );

        var width = height * 1.7;

        var burndown = $("<div/>", {
          class: "burndown_container",
          style: "width: " + width + "px;",
        }).appendTo(user.children(".worklog"));

        var iframe2 = $("<iframe/>", {
          scrolling: "no",
          frameborder: "no",
          style: "width: " + width + "px;height: " + height + "px;",
        });

        iframe2.appendTo(burndown);

        $.ajax({
          type: "GET",
          url: burndown_path,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", credentials.token);
          },
          success: function (data) {
            iframe2.attr("src", "data:text/html;charset=utf-8," + data);
          },
          error: function (jqxhr, textStatus, error) {},
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

  views.MasterView = MasterView;
})(viewer.views);
