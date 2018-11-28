/**
 * Окно для вывода какой-либо информации пользователю
 *
 * Параметры:
 *   cmp_width — ширина окна (по умолчанию 500)
 *   cmp_html - текст сообщения в html формате
 */
 
Application.components.PluginSelector = Ext.extend(Ext.Window, {

  initComponent : function () {
    var component = this;

    Ext.apply(this, {
      bodyStyle: 'padding: 6px 0 6px 6px',
      title: 'Выбор плагина ЭЦП',
      width: 400,
      resizable: false,
      modal: true,
      frame: true,
      items: [
        {
          xtype     : 'htmleditor',
          id        : 'plugin-info',
          width     : 375,
          readOnly  : true,
          value      : 'Крипто-Про Browser Plug-In ' +
          'позволит работать из любого браузера любой операционной системы ' +
          '(<a href="/resources/cryptopro/cadesplugin.exe">Установить</a>). ' +
          'Для работы в Firefox версии 52 и выше требуется дополнительно установить ' +
          '<a href="/resources/cryptopro/firefox_cryptopro_extension_latest.xpi">расширение для браузера</a>.',
          listeners : {
            render: function() {
              Ext.getCmp('plugin-info').getToolbar().hide();
            }
          }
        },
        {
          xtype: 'radiogroup',
          id:'plugin-selected',
          width: 375,
          columns: [1, 1],
          border:false,
          vertical: true,
          items: [
            {
              boxLabel: 'Крипто-Про Browser Plug-In',
              name: 'pluginradiogrp',
              inputValue: 'cryptopro',
              checked: component.isCurrentPlugin('cryptopro')
            }
          ]
        }
      ],
      buttons: [{
        text: 'Выбрать',
        handler: function() {
          var selection = Ext.getCmp('plugin-selected').getValue().inputValue;
          component.updatePlugin(selection);
          component.destroy();
        },
        scope: this
      }, {
        text: 'Отмена',
        handler: function() {
          component.destroy();
        },
        scope: this
      }]
    });
    
    Application.components.PluginSelector.superclass.initComponent.call(this);
  },

  updatePlugin: function(plugin) {
    Main.signaturePlugin = plugin;
    Main.signaturePluginByDefault = false;

    Ext.util.Cookies.set('ext-current-plugin', plugin);
  },

  isCurrentPlugin: function(plugin) {
    return Main.signaturePlugin == plugin;
  }
});
