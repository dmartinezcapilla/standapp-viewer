(function (interactors) {
  function SprintInteractor() {}

  Object.defineProperties(SprintInteractor.prototype, {
    getList: {
      value: function (startAt, boardId, listener) {
        $.ajax({
          type: "GET",
          url:
            credentials.server +
            "/rest/agile/1.0/board/" +
            boardId +
            "/sprint?maxResults=1000&startAt=" +
            startAt,
          dataType: "json",
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", credentials.token);
          },
          success: function (json) {
            listener.onSuccess(json);
          },
          error: function (jqxhr, textStatus, error) {
            listener.onError(error);
          },
        });
      },
      enumerable: false,
    },
    saveDefaultBoard: {
      value: function (boardId, listener) {
        $.ajax({
          type: "POST",
          url: "/data/default_board.json",
          data: JSON.stringify({
            boardId: boardId,
          }),
          dataType: "json",
          contentType: "application/json",
          beforeSend: function (xhr) {},
          success: function (json) {
            listener.onSuccess(json);
          },
          error: function (jqxhr, textStatus, error) {
            if (textStatus !== "abort") {
              listener.onError(jqxhr.responseJSON);
            }
          },
        });
      },
      enumerable: false,
    },
  });

  interactors.SprintInteractor = SprintInteractor;
})(viewer.interactors);
