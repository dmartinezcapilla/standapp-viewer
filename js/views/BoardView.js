(function (views) {
  var self;

  function BoardView(presenter) {
    this.presenter = presenter;
  }

  Object.defineProperties(BoardView.prototype, {
    init: {
      value: function () {
        var self = this;

        $("#boardList").html("");

        self.presenter.getList();

        $("#content").kinetic({ cursor: "auto" });
      },
      enumerable: false,
    },

    load: {
      value: function (data, defaultBoard) {
        $.each(data.values, function (key, value) {
          const optionElement = `<option value="${value.id}">${value.name}</option>`;
          $("#boardList").append(optionElement);
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

  views.BoardView = BoardView;
})(viewer.views);
