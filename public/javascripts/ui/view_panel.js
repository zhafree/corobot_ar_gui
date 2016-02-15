zebra.package("ui.ros", function(pkg, Class) {

    eval(zebra.Import("ui", "layout"));

    pkg.ViewPage = new Class(Panel, [
        function() {
            this.$super();
            this.setLayout(new BorderLayout(4, 4));
            this.setPadding(4);
            this.add(TOP, pkg.createBorderPan("Map View", this.mapPage()));
            this.add(BOTTOM, this.cameraPage());
        },

        function mapPage() {
            var mapPanel = new Panel(new FlowLayout(CENTER, CENTER, HORIZONTAL, 4));
            mapPanel.setId("map_view");
            mapPanel.setPreferredSize(728, 532);

            return mapPanel;
        },

        // depth and rgb views
        function cameraPage() {
            var cp = new Panel(new BorderLayout(4, 4));
            cp.setPadding(4);

            var depthPanel = new Panel(new FlowLayout(CENTER, CENTER, HORIZONTAL, 4));
            depthPanel.setId("depth_view");
            depthPanel.setPreferredSize(360, 200);

            var rgbPanel = new Panel(new FlowLayout(CENTER, CENTER, HORIZONTAL, 4));
            rgbPanel.setId("rgb_view");
            rgbPanel.setPreferredSize(360, 200);

            cp.add(LEFT, pkg.createBorderPan("Kinect Depth", depthPanel));
            cp.add(RIGHT, pkg.createBorderPan("Kinect RGB", rgbPanel));

            return cp;
        }
    ]);
});
