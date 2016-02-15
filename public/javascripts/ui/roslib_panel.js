zebra.package("ui.ros", function(pkg, Class) {

    eval(zebra.Import("ui", "layout"));

    pkg.RoslibPage = new Class(Panel, [
        function() {
            this.$super();
            this.setLayout(new BorderLayout(4, 4));
            this.setPadding(4);
            this.add(TOP, pkg.createBorderPan("Ros Topics", this.topicPage()));
        },

        function topicPage() {
            var topicPanel = new Panel(new ListLayout(4));
            topicPanel.setId("topic_view");
            topicPanel.setPreferredSize(244, 759);

            return topicPanel;
        }
    ]);
});
