zebra.package("ui.ros", function(pkg, Class) {

    eval(zebra.Import("ui", "layout"));

    pkg.ViewPage = new Class(Panel, [
        function() {
            this.$super();
            this.setLayout(new BorderLayout(1, 1));
            this.setPadding(4);
            this.add(TOP, pkg.createBorderPan("Kinect RGB Thumbnail", this.thumbnailPage()));
            this.setPreferredSize(340, 272);
        },

        function thumbnailPage() {
            var thumbnailPanel = new Panel(new FlowLayout(CENTER, CENTER, HORIZONTAL, 4));
            thumbnailPanel.setId("thumbnail_view");
            thumbnailPanel.setPreferredSize(324, 244);

            return thumbnailPanel;
        }
    ]);
});
