Ext.ns('Main.layout');

Main.layout.top_toolbar = null;

Main.layout.center_panel = new Ext.Panel({
  id: 'layout_center_panel',
  //autoScroll:true,
  //region: 'center',
  //layout: 'fit',
  //title: 'Процедуры',
  border: false,
  frame: false,
  listeners: {
    application_ready: function() {
      var clock = Ext.getCmp('site-clock');
      var loginClock = Ext.getCmp('login-site-clock');
      var lastup = 0;
      var lastup_s = 0;
      var clockFormat = 'd M H:i';

      function updateTime() {
        Main.app.fireEvent('getupdate');
        Main.server_time_offset = undefined;
        lastup_s = 0;
      }

      clock.getEl().on('click', function(){ updateTime(); });
      loginClock.getEl().on('click', function() { updateTime(); });
      Main.app.on('timeupdated', function(time, tz){
        updateServerTimeOffset(tz, time);
        Ext.TaskManager.stop(clockTask);
        lastup_s = 0;
        Ext.TaskManager.start(clockTask);
      });

      var clockTask = {
        run: function(){
          var date=new Date();
          var ts = date.getMinutes()+date.getHours()*60+date.getDay()*3600;
          var date_s = false;
          var ts_s = 0;
          if (undefined !== Main.server_time_offset) {
            date_s = new Date();
            date_s.setTime(date_s.getTime() - Main.server_time_offset);
            ts_s = date_s.getMinutes()+date_s.getHours()*60+date_s.getDay()*3600;
            if ((lastup_s && Math.abs(ts_s-lastup_s)>5)
                //|| (Main.server_time_offset_last_sync && (date-Main.server_time_offset_last_sync>5*60*1000 || date-Main.server_time_offset_last_sync<0) )
               )
            {
              // если серверное время вдруг прыгнуло больше чем на 5 минут => со временем что-то не то, надо подвести часики
              updateTime();
              date_s = false;
            }
          }
          if (ts==lastup && ts_s==lastup_s) {
            return;
          }
          lastup = ts;
          lastup_s = ts_s;
          var is_date_s_required = true;
          for (var i = 0; i < Main.modules.length; i++) {
              if (Main.modules[i] == 'RPC_po') {
                  is_date_s_required = false;
                  break;
              }
          }
          var datestr = 'Местное время: '+date.format(clockFormat);
          if (date_s) {
            datestr += ' Время сервера: '+date_s.format(clockFormat);
          }
          if (!is_date_s_required) {
              datestr = date.format(clockFormat);
          }
          if (clock.warning) {
            datestr = '<span ext:qtip="'+clock.warning+'" class="icon-silk-bullet_error r-icon-text">'+datestr+'</span>';
          }
          clock.setText(datestr);
          loginClock.update(datestr);
        },
        interval: 1000
      }
      Ext.TaskManager.start(clockTask);
    },
    clock_warning: function(text) {
      var clock = Ext.getCmp('site-clock');
      clock.warning = text;
    }
  }
});

Main.layout.north_panel = new Ext.Panel({
  //region: 'north',
  id: 'layout_north_panel',
  frame: false,
  border: false,
  title: '',
  align: 'stretch',
  autoHeight: true,
  hidden: true,
  items: [
    //Main.layout.top_toolbar,
    {
      id        : 'layout_announcement_panel',
      width     : '100%',
      border    : false,
      frame     : false
    },
    {
      border: false,
      height: 84,
      id: 'layout_header_panel',
      cls: 'page-header',
      html: '<div class="header-add-wrapper-logo">' +
        '<a class="header-href" href="/"><img src="/images/logo.png"></a>' +
        '<div class="header-panel-text-wrapper">' +
          '<div class="header-panel-text-main">' +
            'АВТОМАТИЗИРОВАННАЯ СИСТЕМА УПРАВЛЕНИЯ ЗАКУПОЧНОЙ ДЕЯТЕЛЬНОСТЬЮ' +
          '</div>' +
          '<div class="header-panel-text-sub">' +
            'ПАО "МАШИНОСТРОИТЕЛЬНЫЙ ЗАВОД ИМЕНИ М. И. КАЛИНИНА, Г. ЕКАТЕРИНБУРГ"' +
          '</div>' +
        '</div>' +
        '<div class="header-panel-additional-images"></div>' +
      '</div>'
    },
    {
      id: 'layout_title_panel',
      title: '&nbsp;',
      width: '100%',
      border: true,
      frame: false,
      tools: [{
        id: 'maximize',
        handler: function() {
          var tbar = Ext.getCmp('layout_title_panel');
          tbar.tools.maximize.hide();
          tbar.tools.restore.show();
          callComponents(['layout_header_panel', 'layout_account_data_panel'], function(c){c.hide();});
          Main.layout.north_panel.doLayout();
          Main.layout.center_panel.doLayout();
        },
        qtip: 'Развернуть'
      }, {
        id: 'restore',
        hidden: true,
        handler: function() {
          var tbar = Ext.getCmp('layout_title_panel');
          tbar.tools.maximize.show();
          tbar.tools.restore.hide();
          callComponents(['layout_header_panel', 'layout_account_data_panel'], function(c){c.show();});
          Main.layout.north_panel.doLayout();
          Main.layout.center_panel.doLayout();
        },
        qtip: 'Восстановить'
      }]
    }
  ]
});

Main.layout.north_panel_for_login = new Ext.Panel({
  id: 'layout_north_panel_for_login',
  frame: false,
  border: false,
  title: '',
  align: 'stretch',
  autoHeight: true,
  hidden: true,
  items: [
    {
      id        : 'layout_announcement_panel',
      width     : '100%',
      border    : false,
      frame     : false
    },
    {
      border: false,
      height: 90,
      cls: 'page-header',
      html: '<div class="login-header-wrapper">' +
      '<div class="login-header-title">АСУЗД&nbsp;&nbsp;&nbsp;ПАО &laquo;МЗИК&raquo;</div></div>'
    }
  ]
});

Main.layout.south_panel = new Ext.Toolbar({
  cls: 'toolbar-south-panel',
  border: true,
  defaultType: 'tbtext',
  height: 25,
  hidden: true,
  items:[
    {
      id: 'site-copyright',
      text: 'Загрузка...',
      cls: 'x-statusbar cleanborder x-unselectable copyright-panel',
      listeners: {
        afterrender: function() {
          if (Ext.debug) {
            this.getEl().on('dblclick', function(){
              Ext.log('Debug console invoked');
            });
          }
        }
      }
    },
    '->',
    {
      cls: 'clock-panel',
      id: 'site-clock',
      text: ''
    }
  ]
});
Main.layout.south_panel_for_login = new Ext.Panel({
  id: 'layout_south_panel_for_login',
  frame: false,
  border: false,
  title: '',
  align: 'stretch',
  autoHeight: true,
  autoWidth: true,
  autoShow: true,
  hidden: true,
  items:[
    {
      border: false,
      height: 90,
      autoWidth: true,
      id: 'layout_footer_panel',
      cls: 'footer-copy-wrapper',
      html: '<div class="login-footer-wrapper">' +
      '<div class="login-footer-copyright">' +
      '&copy; Автоматизированная система управления закупочной деятельностью ПАО "МЗИК"' +
      '</div></div>'
    },
    {
      cls: 'login-site-clock',
      border: false,
      unstyled: true,
      id: 'login-site-clock',
      text: ''
    }
  ]
});


/*Main.layout.west_panel = new Ext.Panel({
  region: 'west',
  layout: 'fit',
  split: true,
  border: true,
  frame: false,
  collapsible: true,
  width: 300,
  hidden: true
});*/

Main.layout.root = new Ext.Viewport ({
  layout: 'border',
  autoWidth: true,
  autoHeight: true,
  items: [
    {
      region: 'center',
      autoScroll:true,
      border: false,
      id: 'layout_center_outer_panel',
      items: [
        Main.layout.north_panel_for_login,
        Main.layout.north_panel,
        Main.layout.center_panel
      ]
    },
    {
      region: 'south',
      autoScroll:true,
      border: false,
      autoHeight: true,
      id: 'layout_south_outer_panel',
      items:[
        Main.layout.south_panel,
        Main.layout.south_panel_for_login
      ]
    }
  ]
});
