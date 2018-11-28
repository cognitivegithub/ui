Ext.define('Application.components.treeSelector', {
  extend: 'Ext.form.FieldSet',
  style: 'padding-left: 0; padding-right: 0;',

  name: 'type',
  keyName: 'type_id',
  addText: 'Добавление',
  addButtonText: 'Добавить',
  emptyText: 'Элемент не выбран',
  textFormat: '{0}: {1}',
    // tree window params
  windowWidth: 700,
  windowHeight: 400,
  windowAutoSize: true,
  // tree params
  treeRootName: '0',
  // По умолчанию фцункция поиска RPC.Reference.<name>
  treeDirectFn: null,
  treeTextFormat: '{0} {1}',
  // Включить поиск по дереву
  treeSearch: false,
  // По умолчанию фцункция поиска RPC.Reference.<name>Search
  treeDirectSearchFn: null,
  // Подсказака в поле поиска
  treeSearchHelp: 'Поиск',
  // Максимальное количество выбранных из списка элементов
  // 0 - не ограничено
  maxItems: 0,

  initComponent: function() {
    this.tree_id = Ext.id();
    this.cc_current = Ext.id();
    this.text_empty = Ext.id();
    this.add_btn_id = Ext.id();

    var title = this.title;
    this.title = null;

    var addButton = {
      xtype: 'button',
      text: this.addButtonText,
      id: this.add_btn_id,
      scope: this,
      handler: this.addHandler
    };

    Ext.apply(this, {
      layout: 'form',
      anchor: '100%',
      defaults: {
        anchor: '100%',
        allowBlank: false
      },
      autoHeight: true,
      frame: false,
      labelWidth: 200,
      items: [
        {
          xtype: 'container',
          layout: 'column',
          fieldLabel: title,
          items: [
            {
              html: '&nbsp;',
              columnWidth: 1
            },
            addButton
          ]
        },
        {
          xtype: 'panel',
          border: false,
          id: this.cc_current,
          items: [
            {
              id: this.text_empty,
              bodyCssClass: 'subpanel',
              cls: 'spaced-panel',
              hidden: true,
              html: this.emptyText
            }
          ],
          listeners: {
            scope: this,
            afterrender: function() {
              this.emptyTextShow();
              this.checkMaxItems();
              this.doLayout();
            }
          }
        }
      ]
    });

    Application.components.treeSelector.superclass.initComponent.call(this);
  },

  addHandler: function() {
    var tree = new Application.components.treeWindow({
      width: this.windowWidth,
      height: this.windowHeight,
      autoSize: this.windowAutoSize,
      loaderConfig: {
        type: this.name,
        rootName: this.treeRootName,
        directFn: this.treeDirectFn,
        directSearchFn: this.treeDirectSearchFn,
        textFormat: this.treeTextFormat,
        search: this.treeSearch,
        searchHelp: this.treeSearchHelp
      },
      title: this.addText,
      type: this.name,
      keyName: this.keyName,
      listeners: {
        scope: this,
        itemselected: function(n) {
          this.addCategory(n);
          this.emptyTextShow();
          this.checkMaxItems();
          this.doLayout();
        }
      }
    });
    tree.show();
  },

  emptyTextShow: function() {
    var cmp_cc = Ext.getCmp(this.cc_current);
    var cmp_te = Ext.getCmp(this.text_empty);
    if (this.emptyText !== false && cmp_cc.items.length == 1) {
      cmp_te.setVisible(true);
    } else {
      cmp_te.setVisible(false);
    }
  },

  checkMaxItems: function() {
    var btn = Ext.getCmp(this.add_btn_id);
    var cmp_cc = Ext.getCmp(this.cc_current);
    if (this.maxItems != 0 && (cmp_cc.items.length - 1) >= this.maxItems) {
      btn.setVisible(false);
    } else {
      btn.setVisible(true);
      this.doLayout();
    }
  },

  getHtmlString: function(n) {
    var code = n.id || n.code;
    return code ? String.format(this.textFormat, code, n.full_name) : n.full_name;
  },

  addCategory: function(n) {
    var panel = {
      layout: 'column',
      cls: 'spaced-panel',
      bodyCssClass: 'subpanel',
      border: true,
      items: [
        {
          columnWidth: 1,
          xtype: 'panel',
          layout: 'form',
          border: false,
          hideTitle: true,
          cls: 'spaced-cell',
          html: this.getHtmlString(n)
        },
        {
          xtype: 'button',
          text: 'Удалить',
          cls: 'spaced-cell',
          scope: this,
          handler: function(button) {
            var p = button.findParentByType('panel');
            var cur_cat = p.getValue();
            if (Main.config.tree_selector_no_remove_message) {
              p.destroy();
              this.emptyTextShow();
              this.checkMaxItems();
            } else {
              Ext.Msg.confirm('Предупреждение', 'Вы действительно хотите удалить эту категорию \'' + cur_cat.name + '\'?', function(b) {
                if ('yes' == b) {
                  p.destroy();
                  this.emptyTextShow();
                  this.checkMaxItems();
                }
              }.createDelegate(this));
            }
          }
        }
      ],
      name: this.name + '[]',
      getValue: function() {
        var obj = {
          id: n.id,
          name: n.text,
          full_name: n.full_name,
          path: n.path
        };
        obj[this.keyName] = n[this.keyName];
        return obj;
      }.createDelegate(this)
    };
    var cc_panel = Ext.getCmp(this.cc_current);
    cc_panel.add(panel);
  },

  removeAllCategories: function() {
    var cmp_cc = Ext.getCmp(this.cc_current);
    var cmp_te = Ext.getCmp(this.text_empty);
    cmp_cc.items.each(function(val) {
      if (val.getId() != cmp_te.getId()) {
        val.destroy();
      }
    });
  },

  setValues: function(val) {
    if (val) {
      this.removeAllCategories();
      for (var prop in val) {
        if (val.hasOwnProperty(prop)) {
          this.addCategory(val[prop]);
        }
      }
      this.emptyTextShow();
      this.checkMaxItems();
      this.doLayout();
    }
  }
});
