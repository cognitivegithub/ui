
Ext.define('Application.components.nomenclaturePanel', {
  extend: 'Ext.form.FieldSet',
  initComponent: function() {
    var component = this;

    this.addEvents('nomenclatureselected');

    Ext.apply(this, {
      style: 'padding-top: 0px; padding-bottom: 0px;',
      items: [],
      buttons: [{
        text: 'Добавить позицию',
        handler: function() {
          var win = new Application.components.nomenclatureWindow({type: component.type||'okdp'});
          component.relayEvents(win, ['nomenclature_selected']);
          win.show();
        }
      }],
      listeners: {
        nomenclature_selected: function(n) {
          component.addNomenclature(n);
          component.doLayout();
        }
      },
      addNomenclature: function(n) {
        component.add({
          layout: 'column',
          cls: 'spaced-panel',
          bodyCssClass: 'subpanel',
          border: true,
          items: [{
            columnWidth: 1,
            xtype: 'panel',
            layout: 'form',
            border: false,
            hideTitle: true,
            cls: 'spaced-cell',
            html: (n.id||n.code)+': '+n.full_name
          }, {
            xtype: 'button',
            text: 'Удалить',
            cls: 'spaced-cell',
            handler: function() {
              var p = this.findParentByType('panel');
              component.remove(p);
            }
          }],
          nomenclature: {code: n.id||n.code, name:n.text, full_name:n.full_name, path: n.path},
          name: 'nomenclature[]',
          getValue: function() {
            return this.nomenclature;
          }
        });
      },
      setValue: function(v) {
        if (!v) {
          return
        }
        this.items.each(function(c){
          if (c.nomenclature) {
            component.remove(c);
          }
        });
        for (var i=0; i<v.length; i++) {
          this.addNomenclature(v[i]);
        }
        component.doLayout();
      }
    });
    Application.components.nomenclaturePanel.superclass.initComponent.call(this);
    autoSetValue(this);
  }
});
