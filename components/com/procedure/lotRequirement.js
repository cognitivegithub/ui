Ext.define('Application.components.lotRequirement', {
  extend: 'Ext.Panel',
  autoHeight: true,
  parent: null,
  border: true,

  type: null,
  readonlyFields: false,
  specialField: false,
  typesItems: [],

  initComponent: function() {
    var component = this;
    this.ids = initIds(['value_field_label','name_field']);
    this.labelWidth = this.labelWidth || 300;

    var items = this.createItems();

    Ext.apply(this,
      {
        border: true,
        layout: 'form',
        name: 'requirements[]',
        labelWidth: this.labelWidth,
        cls: 'spaced-panel',
        hideLabel: true,
        requirement: true,
        defaults: {
          border: false
        },
        items: [
          {
            fieldLabel: 'Требование к характеристикам товара/услуги',
            html: ''
          },
          {
            layout: 'table',
            layoutConfig: {
              columns: 5
            },
            hideLabel: true,
            defaults: {
              allowBlank: false,
              cellCls: 'spaced-cell'
            },
            items: items,
            ref: 'ctrl_fields',
            select_format: function(current_val) {
              if (!current_val) return;
              if (current_val >= 10) {
                return ;
              }

              var fields = this.getComponent(3); // получаем панель с полями разных типов
              var fields_count = fields.items.getCount();

              // хайдим все
              for (var i = 0; i < fields_count; i++) {
                fields.getComponent(i).setVisible(false).setDisabled(true);
              }
              // показываем нужное
              if (current_val != 5) {
                fields.getComponent(current_val - 1).setVisible(true).setDisabled(false);
              } else {
                fields.getComponent(current_val - 1).setVisible(true);
              }
            }
          }
        ]
      }
    );

    Application.components.lotRequirement.superclass.initComponent.call(this);
    autoSetValue(this);
  },
  getValue: function() {
    var v = {};
    if (this.requirement_id) {
      v.id = this.requirement_id;
    }
    collectComponentValues(this, v, true);
    return v;
  },
  setValue: function(v) {
    this.requirement_id = v.id;
    setComponentValues(this, v, true);
    this.getComponent(1).select_format(v.format);
    //this.getComponent(1).getComponent(1).fireEvent('select');
  },
  removeFn: function() {
    this.destroy();
    this.doLayout();
  },

  validate: function(target) {
    var fields = target ? target : this.ctrl_fields;
    var ret = {
      msg: [],
      success: true,
      fatal: false
    };
    fields.items.each(function(field, ind) {
      if (field.getItemId() == 'value_filed') {
        var valid = this.validate(field);
      } else {
        var valid = this.validateField(field);
      }
      if (!valid.success) {
        ret.success = false;
        ret.fatal = true;
        ret.msg.push(valid.msg);
      }
    }, this);

    return ret;
  },

  validateField: function(field) {
    var ret = {
      msg: '',
      success: true,
      fatal: false
    };
    var valid = true;
    if (field instanceof Ext.form.Field) {
      var fieldName = field.getName();
       valid = field.isValid();
    }

    if (!valid) {
      ret.success = false;
      ret.fatal = true;
    }
    switch (fieldName) {
      case 'requirement':
        ret.msg = 'Укажите наименование требования к товару';
        break;
      case 'type':
        ret.msg = 'Не верный тип требования к товару';
        break;
      case 'format':
        ret.msg = 'Не вернно указан формат требования к товару';
        break;
      case 'value':
        var name_param = Ext.getCmp(this.ids.name_field);
        var label = name_param.getValue();
        ret.msg = (label ? 'Необходимо указать значение для требования "'+ label +'"': 'Не верно указано значение параметра требования к товару');
        break;
    }

    return ret;
  },

  createItems: function() {
    var component = this;
    var store = Application.models.Lot.getRequirementTypeStore();
    var types = Application.models.Lot.getRequirementFormatStore();
    if (this.typesItems.length) {
      types.push(this.typesItems);
    }
    // значение параметра
    var allowBlank = !Main.config.procedure_coordination;

    return [
      {
        xtype: 'textfield',
        readOnly: this.specialField || this.readonlyFields,
        width: 160,
        id: component.ids.name_field,
        fieldLabel: 'характеристика',
        name: 'requirement'
      },
      {
        xtype: 'combo',
        readOnly: this.specialField || this.readonlyFields,
        store: store,
        valueField: 'type',
        displayField: 'name',
        mode: 'local',
        editable: false,
        triggerAction: 'all',
        width: 140,
        value: this.type || 'EXACT',
        name: 'type',
        fieldLabel: 'Тип требования',
        listeners: {
          select: function() {
            var parent_panel = this.findParentByType('panel');
            var param_format = parent_panel.getComponent(2);
            var param_value = parent_panel.getComponent(3);

            var label = Ext.getCmp(component.ids.value_field_label);
            if (this.getValue() === 'LIST') {
              parent_panel.select_format(1);
              param_format.setValue(1).disable();
              if(label.body) {
                label.body.update('Значения списка через ::<br/>Например: Дней::Лет');
              } else {
                label.html='Значения списка через ::<br/>Например: Дней::Лет';
              }
            } else {
              param_format.enable();
              if(label.body) {
                label.body.update('Значение параметра');
              } else {
                label.html='Значение параметра';
              }
            }
            if (param_format) {
              if (this.getValue() == 'REQ') {
                param_format.enable();
                param_value.disable();
              } else if (this.getValue() == 'LOGICAL') {
                param_format.disable();
              } else {
                param_format.enable();
                param_value.enable();
              }
              param_format.setValue(null);
              var my_store = param_format.getStore();
              if (['MIN', 'MAX'].indexOf(this.getValue()) >= 0) {
                my_store.filter('id', /[2,3,4,6]/);
              } else {
                my_store.clearFilter();
              }
            }
          }
        }
      },
      {
        xtype: 'combo',
        readOnly: this.specialField || this.readonlyFields,
        store: types,
        valueField: 'id',
        displayField: 'name',
        mode: 'local',
        editable: false,
        triggerAction: 'all',
        width: 130,
        value: 1,
        name: 'format',
        fieldLabel: 'Формат',
        listeners: {
          select: function() {
            var p = this.findParentByType('panel');
            p.select_format(this.getValue());
          }
        }
      },
      {
        xtype: 'panel',
        cellCls: 'spaced-cell',
        itemId: 'value_filed',
        items: [
          {
            xtype: 'textfield',
            hidden: this.specialField || this.readonlyFields,
            disabled: this.specialField || this.readonlyFields,
            width: 140,
            fieldLabel: 'Значение параметра',
            allowBlank: allowBlank,
            name: 'value'
          },
          {
            xtype: 'numberfield',
            width: 140,
            fieldLabel: 'Значение параметра',
            name: 'value',
            allowBlank: allowBlank,
            hidden: true,
            disabled: true
          },
          {
            xtype: 'datefield',
            width: 140,
            fieldLabel: 'Значение параметра',
            name: 'value',
            allowBlank: allowBlank,
            hidden: true,
            disabled: true
          },
          {
            xtype: 'datefield',
            format: 'd.m.Y H:i',
            altFormats: 'c|d.m.Y H:i|d.m.Y g:i',
            width: 140,
            fieldLabel: 'Значение параметра',
            name: 'value',
            allowBlank: allowBlank,
            hidden: true,
            disabled: true
          },
          {
            xtype: 'combo',
            store: [
              [1, 'Да'],
              [0, 'Нет']
            ],
            mode: 'local',
            editable: false,
            triggerAction: 'all',
            width: 140,
            value: 1,
            name: 'value',
            fieldLabel: 'Значение параметра',
            allowBlank: allowBlank,
            hidden: true,
            disabled: true
          },
          {
            xtype: 'numberfield',
            width: 140,
            fieldLabel: 'Значение параметра',
            name: 'value',
            allowBlank: allowBlank,
            hidden: true,
            disabled: true
          }
        ]
      }, {
        xtype: 'button',
        text: 'Удалить',
        hidden: this.specialField || this.readonlyFields,
        handler: this.removeFn.createDelegate(this)
      },
      {
        html: 'наименование параметра',
        cls: 'subtitle',
        border: false,
        width: 150
      },
      {
        html: 'тип требования',
        cls: 'subtitle',
        border: false,
        width: 120
      },
      {
        html: 'формат',
        cls: 'subtitle',
        border: false,
        width: 120
      },
      {
        html: 'значение параметра',
        hidden: this.specialField,
        readOnly: this.readonlyFields,
        cls: 'subtitle',
        border: false,
        width: 140,
        id: component.ids.value_field_label
      }
    ];
  }
});
