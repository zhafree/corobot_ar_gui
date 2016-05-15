// Zebra UI frame
zebra.ready(function() {
  // import all classes, functions, constants
  // from zebra.ui, zebra.layout packages
  // from custom ui.ros package
  eval(zebra.Import("ui", "layout", "ui.ros"));

  // create canvas
  var desktop = new zCanvas("GUICanvas");
  var root = desktop.root;
  root.setLayout(new FlowLayout(
      zebra.layout.CENTER,
      zebra.layout.TOP,
      zebra.layout.VERTICAL, 4));
  root.setBorder(new Border("rgba(50,50,50,0.5)", 2));
  root.setPadding(4);
  root.setBackground("rgba(200,200,200,0.5)");

  // Add root layer UI components
  root.add(RIGHT, new ViewPage());
  root.add(BOTTOM, new RoslibPage());
});
