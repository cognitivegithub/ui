
Ext.define('Application.components.contragentsSelectForm', {
  extend: 'Ext.Panel',
  emptyText: 'Заполнены не все обязательные поля',
  initComponent: function() {
    this.error_panel_id = Ext.id();
    var component = this;

    function validate() {
      if (!component.inValidation) {
        component.inValidation = true;
        component.isValid();
        component.inValidation = false;
      }
    }
    function onBlur(f) {
      var panel = f.findParentByType('panel');
      if (!panel) {
        return;
      }
      var v = {};
      var inn = panel.getPanel('inn');
      var kpp = panel.getPanel('kpp');
      if (!inn || !kpp || !inn.isValid() || !kpp.isValid()) {
        return;
      }
      inn = inn.getValue();
      kpp = kpp.getValue();
      if (panel.lastInn==inn && panel.lastKpp==kpp) {
        return;
      }
      var search = {
        limit: 1,
        inn: inn
      };
      if (kpp) {
        search.kpp = kpp;
      }
      RPC.Company.search(search, function(resp){
        var email = panel.getPanel('email');
        if (!email) {
          return;
        }
        panel.lastInn=inn;
        panel.lastKpp=kpp;
        if (resp && resp[1] && resp[1].rowid) {
          email.setRawValue(resp[1].full_name);
          panel.autoSetEmail = true;
          email.disable();
        } else {
          if (panel.autoSetEmail) {
            email.setValue('');
          }
          panel.autoSetEmail = false;
          email.enable();
          email.isValid();
        }
      });
    }
    this.itemTemplate = {
      layout: 'table',
      columns: 4,
      itemPanel: true,
      cls: 'spaced-bottom-shallow',
      items: [{
        cellCls: 'width_200px',
        xtype: 'textfield',
        name: 'inn',
        allowBlank: false,
        vtype: (Main.config.validate_company_inn ? 'inn' : null),
        minLength: 10,
        maxLength: 12,
        width: '90%',
        blankText: this.emptyText,
        minLengthText: 'Поле ИНН не может быть короче 10 знаков',
        maxLengthText: 'Поле ИНН не может быть длиннее 12 знаков',
        vtypeText: 'Поле ИНН заполнено некорректно',
        listeners: {
          blur: onBlur,
          invalid: validate,
          valid: validate
        }
      }, {
        cellCls: 'width_200px',
        xtype: 'textfield',
        name: 'kpp',
        allowBlank: true,
        minLength: 9,
        maxLength: 9,
        width: '90%',
        blankText: this.emptyText,
        minLengthText: 'Поле КПП не может быть короче 9 знаков',
        maxLengthText: 'Поле КПП не может быть длиннее 9 знаков',
        listeners: {
          blur: onBlur,
          invalid: validate,
          valid: validate
        }
      }, {
        xtype: 'textfield',
        name: 'email',
        allowBlank: false,
        disabled: true,
        vtype: 'email',
        blankText: this.emptyText,
        vtypeText: 'Поле email заполнено некорректно',
        width: '90%',
        listeners: {
          blur: validate,
          invalid: validate,
          valid: validate
        }
      }, {
        cellCls: 'width_100px',
        xtype: 'button',
        text: 'Удалить',
        iconCls: 'icon-silk-delete',
        handler: function(b) {
          this.remove(b.findParentByType('panel'));
          this.isValid();
        },
        scope: this
      }],
      isValid: function() {
        var subcomponents = ['inn', 'kpp', 'email'];
        var valid = true;
        for (var i=subcomponents.length-1; i>=0; i--) {
          var p = this.getPanel(subcomponents[i]);
          if (p && !p.isValid()) {
            this.activeError = p.getActiveError();
            valid = false;
            break;
          }
        }
        if (valid) {
          this.activeError = false;
        }
        return valid;
      },
      getPanel: function(type) {
        var p = this.find('name', type);
        return (p&&p[0])?p[0]:null;
      }
    };
    if (!this.items) {
      this.items = [];
    }
    this.extra_items_top = this.items.length+1;
    this.extra_items_bottom = 2;
    this.items.unshift({
        html: this.title||'Укажите список контрагентов',
        cls: 'spaced-bottom'
    });
    this.items.push({
        layout: 'table',
        columns: 4,
        cls: 'spaced-bottom-shallow',
        items: [{
          html: 'ИНН'+REQUIRED_FIELD,
          cellCls: 'width_200px x-inner-header'
        }, {
          html: 'КПП (для юр. лиц)',
          cellCls: 'width_200px x-inner-header'
        }, {
          html: 'Email (если заявитель отсутствует на ЭТП)',
          cellCls: 'x-inner-header'
        }, {
          cellCls: 'width_100px'
        }]
      }, {
        layout: 'table',
        columns: 4,
        items: [{
          colSpan: 3,
          items: [{
            hidden: true,
            width: '100%',
            id: this.error_panel_id,
            cls: 'x-form-invalid-msg',
            html: ''
          }]
        }, {
          cellCls: 'width_100px',
          xtype: 'button',
          text: 'Добавить',
          scope: this,
          iconCls: 'icon-silk-add',
          handler: function(){this.addItem();}
        }]
    });
    Ext.apply(this, {
      header: false
    });
    this.addItem();
    Application.components.contragentsSelectForm.superclass.initComponent.call(this);
  },
  addItem: function(v, batch) {
    var i = Ext.apply({}, this.itemTemplate);
    // пересоздаем объекты, чтобы они были копиями, а не ссылкой на одно и то же
    i.items = [];
    for (var k=0; k<this.itemTemplate.items.length; k++) {
      i.items.push(Ext.apply({}, this.itemTemplate.items[k]));
    }
    if (v) {
      i.items[0].value = v.inn;
      if (v.kpp) {
        i.items[1].value = v.kpp;
      }
      if (v.email) {
        i.items[2].value = v.email;
        if (!v.email_unset) {
          i.items[2].disabled = false;
        }
      }
    }
    if (this.rendered) {
      this.insert(this.items.getCount()-1, i);
      if (!batch) {
        this.doLayout();
      }
      //this.isValid();
    } else {
      this.items.splice(-1, 0, i);
    }
  },
  getValues: function() {
    var values = [];
    this.items.each(function(i){
      if (!i.itemPanel) {
        return;
      }
      var v = {};
      collectComponentValues(i, v);
      values.push(v);
    });
    return values;
  },
  setError: function(txt) {
    var error = Ext.getCmp(this.error_panel_id);
    if (!error) {
      return;
    }
    if (txt) {
      error.update(txt);
      error.show();
    } else {
      error.hide();
    }
  },
  isValid: function() {
    var error = [];
    if (this.items.getCount()<=this.extra_items_top+this.extra_items_bottom) {
      error.push('Не указано ни одного заявителя');
    } else {
      this.items.each(function(i){
        if (!i.itemPanel) {
          return;
        }
        if (!i.isValid()) {
          error.push(i.activeError);
        }
      });
    }
    error = error.unique().join(', ');
    this.setError(error);
    return error===false;
  },
  setValues: function(v) {
    while (this.items.getCount()>this.extra_items_top+this.extra_items_bottom) {
      this.remove(this.extra_items_top+1);
    }
    if (v) {
      for (var i=0; i<v.length; i++) {
        this.addItem(v[i], true);
      }
    } else {
      this.addItem(null, true);
    }
    this.doLayout();
  }
});
