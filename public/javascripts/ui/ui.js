// Zebra UI frame
zebra.ready(function() {
  // import all classes, functions, constants
  // from zebra.ui, zebra.layout packages
  // from custom ui.ros package
  eval(zebra.Import("ui", "layout", "ui.ros"));

  // create canvas
  var desktop = new zCanvas("GUICanvas");
  var root = desktop.root;
  root.setLayout(new BorderLayout(4, 4));
  root.setBorder(new Border());
  root.setPadding(4);

  // Add root layer UI components
  root.add(LEFT, new RoslibPage());
  root.add(RIGHT, new ViewPage());
});
