Ext.ns('Main.layout');

Main.layout.center_panel = new Ext.Panel({
  border: false,
  frame: false,
  listeners: {
    application_ready: function() {
      //
    }
  }
});

Main.layout.north_panel = new Ext.Panel({});

Main.layout.root = new Ext.Viewport ({
  layout: 'border',
  autoWidth: true,
  autoHeight: true,
  items: [
    {
      region: 'center',
      autoScroll:true,
      border: false,
//      id: 'layout_center_outer_panel',
      items: [
        Main.layout.center_panel
      ]
    }
  ]
});
