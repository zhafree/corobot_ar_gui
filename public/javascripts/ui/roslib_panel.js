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

            var topicLabel = new TextField("/odom").properties({
                font: "26px Futura, Helvetica, sans-serif",
                color: "black",
                padding: 8,
                background: "white"
            });

            var typeLabel = new TextField("nav_msgs/Odometry").properties({
                font: "26px Futura, Helvetica, sans-serif",
                color: "black",
                padding: 8,
                background: "white"
            });

            var resultLabel = new MLabel("").properties({
                font: "16px Futura, Helvetica, sans-serif",
                color: "black",
                padding: 8
            });

            var odomSubscriber = null;
            var buttonLabel = new Label("Subscribe");
            var subscribeButton = new Button(buttonLabel).properties({ canHaveFocus: false });
            subscribeButton.bind(function (src) {
                if (buttonLabel.getValue() === "Subscribe") {
                    odomSubscriber = new ROSLIB.Topic({
                        ros : ros,
                        name : topicLabel.getValue(),
                        messageType : typeLabel.getValue()
                    });

                    if (odomSubscriber != null) {
                        odomSubscriber.subscribe(function(msg) {
                            resultLabel.setValue(JSON.stringify(msg, undefined, 2));
                        });
                        buttonLabel.setValue("Unsubscribe");
                    }
                } else {
                    if (odomSubscriber != null) {
                        odomSubscriber.unsubscribe();
                        odomSubscriber == null;
                        buttonLabel.setValue("Subscribe");
                    }
                }
            });

            topicPanel.add(topicLabel);
            topicPanel.add(typeLabel);
            topicPanel.add(subscribeButton);

            var sp = new ScrollPan(resultLabel);
            sp.setPreferredSize(244, 601);
            topicPanel.add(sp);

            return topicPanel;
        }
    ]);
});
