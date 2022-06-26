(function(presenters)
{
    function IssuePresenter(Context)
    {
        this.interactor = Context.getIssueInteractor();
       
        this.userStoryView = Context.getUserStoryView(this);
        this.taskView = Context.getTaskView(this);
        this.metricsView = Context.getMetricsView(this);
        this.randomizeFacilitatorView = Context.getRandomizeFacilitatorView(this);
        this.workView = Context.getWorkView(this);
		this.masterView = Context.getMasterView(this);
    }

    Object.defineProperties(IssuePresenter.prototype,
    {
        getList : {
            value: function(boardId, sprintId)
            {
                var self = this;
                    
                this.interactor.getList(boardId, sprintId, new viewer.listeners.BaseDecisionListener(
                    function(data)
                    {
                        self.userStoryView.load(data);
                        self.taskView.load(data);
                        self.metricsView.load(data);
                        self.randomizeFacilitatorView.load(data);
                        self.workView.load(boardId, data);
                        self.masterView.load(boardId);
                    },
                    function(data)
                    {
                        self.userStoryView.showError(data);
                    }));
            },
            enumerable: false
        }
    });

    presenters.IssuePresenter = IssuePresenter;
})(viewer.presenters);
