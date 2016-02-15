// Zebra UI frame
var desktop = null;
zebra.ready(function() {
  // import all classes, functions, constants
  // from zebra.ui, zebra.layout packages
  eval(zebra.Import("ui", "layout"));

  // create canvas
  desktop = new zCanvas("GUICanvas");
  var root = desktop.root;
  root.setLayout(new BorderLayout(4, 4));
  root.setBorder(new Border());
  root.setPadding(4);

  // Add first layer UI components
  root.add(LEFT, createBorderPan("Information", roslibPage()));
  root.add(RIGHT, viewPage());

  function roslibPage() {
    var rp = new Panel(new ListLayout(4));
    rp.setPadding(4);
    rp.setPreferredSize(248, -1);

    return rp;
  }

  // map and camera views
  function viewPage() {
    var rp = new Panel(new BorderLayout(4, 4));
    rp.setPadding(4);

    var mapPanel = new Panel(new FlowLayout(CENTER, CENTER, HORIZONTAL, 4));
    mapPanel.setId("map_view");
    mapPanel.setPreferredSize(728, 532);

    rp.add(TOP, createBorderPan("Map View", mapPanel));
    rp.add(BOTTOM, cameraPage());

    return rp;
  }

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

    cp.add(LEFT, createBorderPan("Kinect Depth", depthPanel));
    cp.add(RIGHT, createBorderPan("Kinect RGB", rgbPanel));

    return cp;
  }

  function createBorderPan (txt, content, w, h) {
    content = content || new Panel();
    var bp = new BorderPan(txt, content);
    content.setPadding(4);
    w = w || -1;
    h = h || -1;
    bp.setPreferredSize(w, h);
    return bp;
  };
});
