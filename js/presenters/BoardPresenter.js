(function (presenters) {
  function BoardPresenter(Context) {
    this.interactor = Context.getBoardInteractor();
    this.boardView = Context.getBoardView(this);
  }

  Object.defineProperties(BoardPresenter.prototype, {
    getList: {
      value: function (startAt = 0) {
        var self = this;
        let defaultBoard;
        const listener = new viewer.listeners.BaseDecisionListener(
          function (data) {
            defaultBoard = data;
          },
          function () {
            defaultBoard = null;
          },
        );
        this.interactor.getDefaultBoard(listener);
        this.interactor.getList(
          startAt,
          new viewer.listeners.BaseDecisionListener(
            function (data) {
              self.boardView.load(data, defaultBoard);

              if (!data.isLast) {
                self.getList(startAt + data.values.length);
              }
            },
            function (data) {
              self.boardView.showError(data);
            },
          ),
        );
      },
      enumerable: false,
    },
    getDefaultBoard: {
      value: function () {
        var self = this;
        const listener = new viewer.listeners.BaseDecisionListener(
          function (data) {
            return data;
          },
          function () {
            return null;
          },
        );
        this.interactor.getDefaultBoard(listener);
      },
      enumerable: false,
    },
  });

  presenters.BoardPresenter = BoardPresenter;
})(viewer.presenters);
