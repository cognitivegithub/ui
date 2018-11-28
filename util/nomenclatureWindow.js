
Ext.define('Application.components.nomenclatureWindow', {
  extend: 'Ext.Window',
  title: 'Выбор номенклатуры',
  constraint: true,
  hideAction: 'close',
  autoSize: true,
  modal: true,
  selection: null,
  type: this.type||'okdp',
  initComponent: function() {
    var tree_id = Ext.id();
    var component = this;
    if (this.autoSize) {
      this.width = Ext.getBody().getWidth()*0.8;
      this.height = Ext.getBody().getHeight()*0.9;
    }
    this.addEvents('nomenclature_selected');
    this.addEvents('search');
    Ext.apply(this, {
      layout: 'fit',
      items: [{
        tbar: {
          xtype: 'Application.components.searchToolbar',
          searchHelp: 'Поиск по справочнику номенклатур',
          eventTarget: this
        },
        id: tree_id,
        xtype: 'Application.components.nomenclatureTree',
        type: this.type,
        selection: this.selection,
        listeners: {
          nomenclature_selected: function(n) {
            component.fireEvent('nomenclature_selected', n);
            component.close();
          }
        }
      }],
      buttons: [{
        text: 'Выбрать',
        handler: function(){
          var n = Ext.getCmp(tree_id).getSelectedObject();
          var txt = false;
          if (!n) {
            txt = 'Вы не выбрали объект номенклатуры!';
          } else if (!n.leaf) {
            txt = 'Следует выбирать объект номенклатуры, а не целый раздел';
          }
          if (txt) {
            Ext.Msg.alert('Ошибка', txt);
          } else {
            component.fireEvent('nomenclature_selected', n);
            component.close();
          }
        }
      }, {
        text: 'Отменить',
        handler: function() {
          component.close();
        }
      }],
      listeners: {
        search: function(query) {
          if (query /*&& component.query!==query*/) {
            component.query = query;
            var tree = Ext.getCmp(tree_id);
            var s = tree.getSelectedObject();
            s = s?s.id:null;
            tree.mask('Поиск…');
            RPC.Reference.nomenclatureSearch([query, s], component.type, function(resp){
              tree.unmask();
              if (resp.success && resp.result) {
                tree.selectPath(resp.result);
                resp.message = 'Для поиска следующего подходящего значения нажмите кнопку «Искать» еще раз';
              }
              var t = new Ext.QuickTip({
                html: resp.message||'Ничего не нашлось'
              });
              t.showBy(tree.getTopToolbar().getEl());
            });
          }
        }
      }
    });
    Application.components.nomenclatureWindow.superclass.initComponent.call(this);
  }
});
