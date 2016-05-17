zebra.package("ui.ros", function(pkg, Class) {

    eval(zebra.Import("ui", "layout"));

    pkg.RoslibPage = new Class(Tabs, [
        function() {
            this.$super();
            //this.setLayout(new BorderLayout(4, 4));
            //this.setPadding(4);
            this.setPreferredSize(340, 670);
            this.add("Message Query", this.messagePage());
            this.add("ROS Topic Query", this.topicPage());
            this.add("Control", this.modePage());
        },

        function modePage() {
            var modePanel = new Panel(new ListLayout(4));
            modePanel.setId("mode_view");
            modePanel.setPreferredSize(320, 666);
            modePanel.setPadding(4);

            var buttonLabel2 = new Label("Enter edge detection mode");
            var pointCloudButton2 = new Button(buttonLabel2).properties({ canHaveFocus: false });
            pointCloudButton2.bind(function (src) {
                if (Kinect.ColorMode.a > 0.3) {
                    Kinect.ColorMode.a = 0.0;
                    buttonLabel2.setValue("Enter edge detection mode");
                    buttonLabel.setValue("Enter collision detection mode");
                } else {
                    Kinect.ColorMode.a = 0.4;
                    buttonLabel2.setValue("Exit edge detection mode");
                    buttonLabel.setValue("Enter collision detection mode");
                }
            });

            var buttonLabel = new Label("Enter collision detection mode");
            var pointCloudButton = new Button(buttonLabel).properties({ canHaveFocus: false });
            pointCloudButton.bind(function (src) {
                if (Kinect.ColorMode.a > 0.1 && Kinect.ColorMode.a < 0.3) {
                    Kinect.ColorMode.a = 0.0;
                    buttonLabel.setValue("Enter collision detection mode");
                    buttonLabel2.setValue("Enter edge detection mode");
                } else {
                    Kinect.ColorMode.a = 0.2;
                    buttonLabel.setValue("Exit collision detection mode");
                    buttonLabel2.setValue("Enter edge detection mode");
                }
            });

            modePanel.add(pointCloudButton);
            modePanel.add(pointCloudButton2);

            return modePanel;
        },

        function messagePage() {
            var messagePanel = new Panel(new ListLayout(4));
            messagePanel.setId("message_view");
            messagePanel.setPreferredSize(320, 666);
            messagePanel.setPadding(4);

            var hintLabel = new MLabel("Please leave your message below:").properties({
                font: "16px Futura, Helvetica, sans-serif",
                color: "black",
                padding: 8,
            });

            var inputLabel = new TextArea("").properties({
                font: "16px Futura, Helvetica, sans-serif",
                color: "black",
                padding: 8,
                background: "white",
            });
            inputLabel.setPreferredSize(314, 160);

            var savedLabel = new MLabel("").properties({
                font: "16px Futura, Helvetica, sans-serif",
                color: "black",
                padding: 8
            });

            var saveButton = new Button("Save").properties({ canHaveFocus: false });
            saveButton.bind(function (src) {
                savedLabel.setValue(savedLabel.getValue() + "\n======  " + new Date().toLocaleString() +
                                    "  ======\n" + inputLabel.getValue());
                inputLabel.setValue("");
            });

            messagePanel.add(hintLabel);
            messagePanel.add(inputLabel);
            messagePanel.add(saveButton);

            var ssp = new ScrollPan(savedLabel);
            ssp.setPreferredSize(314, 400);
            messagePanel.add(ssp);

            return messagePanel;
        },

        function topicPage() {
            var topicPanel = new Panel(new ListLayout(4));
            topicPanel.setId("topic_view");
            topicPanel.setPreferredSize(320, 666);

            var topicLabel = new TextField("/cari/waypoints").properties({
                font: "26px Futura, Helvetica, sans-serif",
                color: "black",
                padding: 8,
                background: "white"
            });

            var typeLabel = new TextField("geometry_msgs/Point").properties({
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
            sp.setPreferredSize(314, 540);
            topicPanel.add(sp);

            return topicPanel;
        }
    ]);
});
