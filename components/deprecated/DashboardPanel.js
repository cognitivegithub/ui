/**
 * Панель для вывода виджетов
 *
 * Параметры:
 *   нету
 *
 * Евенты:
 *   нету
 */
Application.components.DashboardPanel = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var dashboard_panel_id = Ext.id();

    Ext.apply(this, {
      //height: 500,
      defaults: {
        border: false,
        autoHeight: false
      },
      border: false,
      frame: false,
      header: false,
      layout: 'table',
      id: dashboard_panel_id,
      layoutConfig: {
        columns: 3,
        tableAttrs: {
          cellspacing: 20
        }
      },
      items: [

      ],
      listeners: {
        beforerender: function() {
          var dashboard = this;
          RPC.Cabinet.dashboard(null, function(resp, provider) {
            if(resp.success===true) {
              var widgets = resp.widgets;
              for(var i=0; i<widgets.length; i++) {
                var widgetCmp = {
                  xtype: 'Application.components.'+widgets[i],
                  collapsible: true,
                  collapsed: false
                };
                dashboard.add(widgetCmp);
                dashboard.doLayout();
              }
            } else {
                Ext.MessageBox.alert('Ошибка', 'Нету виджетов');
            }
          })
        }
      }
    }
    );
    Application.components.DashboardPanel.superclass.initComponent.call(this);
  }
});
