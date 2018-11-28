Ext.define('Application.components.treeWindow', {
  extend: 'Ext.Window',

  title: 'Добавление',
  type: 'type',
  keyName: 'type_id',
  autoSize: true,
  loaderConfig: {},

  initComponent: function() {

    this.tree_id = Ext.id();

    this.addEvents('itemselected');
    this.addEvents('search');

    if (this.autoSize) {
      Ext.apply(this, {
        width: Ext.getBody().getWidth() * 0.8,
        height: Ext.getBody().getHeight() * 0.9
      });
    }

    var loader = {
      xtype: 'Application.components.treeLoader',
      id: this.tree_id,
      selection: this.selection,
      listeners: {
        scope: this,
        selected: function(n) {
          this.fireEvent('itemselected', this.idChange(n));
          this.close();
        }
      }
    };
    Ext.apply(loader, this.loaderConfig);

    Ext.apply(this, {
      bodyStyle: 'padding: 10px',
      layout: 'fit',
      items: loader,
      buttons: [
        {
          xtype: 'button',
          text: 'Выбрать',
          scope: this,
          handler: this.selectHandler
        },
        {
          text: 'Закрыть',
          scope: this,
          handler: this.closeHandler
        }
      ]
    });

    Application.components.treeWindow.superclass.initComponent.call(this);
  },

  idChange: function(n) {
    if (!Ext.isEmpty(n.id)) {
      n[this.keyName] = n.id;
      delete n.id;
    }
    return n;
  },

  selectHandler: function() {
    var n = Ext.getCmp(this.tree_id).getSelectedObject();
    var txt = false;
    if (!n) {
      txt = 'Вы не выбрали пункт!';
    } else if (!n.leaf &&
        (
        (!Main.config.allow_select_okved_top_level && (Ext.getCmp(this.tree_id).type == 'okved' || Ext.getCmp(this.tree_id).type == 'okved2' )) ||
        (!Main.config.allow_select_okdp_top_level && Ext.getCmp(this.tree_id).type == 'okdp')
        )
    ) {
      txt = 'Следует выбирать пункт, а не целый раздел';
    }
    if (txt) {
      Ext.Msg.alert('Ошибка', txt);
    } else {
      this.fireEvent('itemselected', this.idChange(n));
      this.close();
    }
  },

  closeHandler: function() {
    this.close();
  }
});
