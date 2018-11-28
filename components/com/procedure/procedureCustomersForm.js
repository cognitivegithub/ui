Ext.define('Application.components.procedureCustomersForm', {
  extend: 'Ext.form.Panel',
  autoHeight: true,
  status: null,
  count_customers: 0,
  max_customers: 0,
  is_oss: false,
  initComponent: function() {

    this.addEvents('addcustomer', 'oosstate');

    this.add_customer_btn_id = Ext.id();

    Ext.apply(this, {
      anchor: '100%',
      allowBlank: false,
      border: false,
      bodyCssClass: 'subpanel-top-padding',
      items: [
        this.createCustomer()
      ],
      buttons: [
        {
          text: 'Добавить заказчика',
          id: this.add_customer_btn_id,
          scope: this,
          handler: function() {
            var customers = new Ext.data.DirectStore({
              autoLoad: true,
              directFn: RPC.Company.representedRightsList,
              root: 'rows',
              sortInfo: {
                field: 'id',
                direction: 'ASC'
              },
              idProperty: 'id',
              paramsAsHash: true,
              fields: ['id', 'date', 'valid_for', 'contragent_representative_id', 'full_name', 'status', 'address',
                       {
                         name: 'disabled',
                         convert: function(v, r) {
                           return this.isCustomerExists(r.id);
                         }.createDelegate(this)
                       }
              ],
              listeners: {
                scope: this,
                load: function() {
                  var self = new customers.recordType({
                    id: Main.contragent.id || 0,
                    full_name: Main.contragent.full_name || '-',
                    address: Main.contragent.legal_address || '-',
                    disabled: this.isCustomerExists(Main.contragent.id)
                  });
                  self.phantom = false;
                  customers.insert(0, self);
                }
              }
            });
            var selector_id = Ext.id();
            var customer_selector = new Ext.Window({
              title: 'Выбор заказчика',
              modal: true,
              width: 600,
              autoHeight: true,
              layout: 'fit',
              items: [
                {
                  layout: 'anchor',
                  frame: true,
                  autoHeight: true,
                  items: [
                    {
                      html: 'Выберите заказчика из списка:'
                    },
                    {
                      xtype: 'Application.components.combo',
                      id: selector_id,
                      disabledField: 'disabled',
                      displayField: 'full_name',
                      valueField: 'id',
                      store: customers,
                      allowBlank: false,
                      editable: false,
                      anchor: '-20',
                      triggerAction: 'all',
                      mode: 'local'
                    }
                  ]
                }
              ],
              buttons: [
                {
                  text: 'Добавить заказчика',
                  scope: this,
                  handler: function() {
                    var selector = Ext.getCmp(selector_id);
                    if (selector.isValid()) {
                      customer_selector.close();
                      var r = customers.find('id', selector.getValue());
                      var rdata = customers.getAt(r);
                      if (rdata && rdata.data) {
                        //noinspection JSPotentiallyInvalidUsageOfThis
                        this.add(this.createCustomer(rdata.data));
                      }
                      this.doLayout();
                    }
                  }
                },
                {
                  text: 'Отмена',
                  handler: function() {
                    customer_selector.close();
                  }
                }
              ]
            });
            customer_selector.show();
          }
        }
      ]
    });

    Application.components.procedureCustomersForm.superclass.initComponent.call(this);
    autoSetValue(this);

    this.on('afterlayout', function() {
      var btn = Ext.getCmp(this.add_customer_btn_id);
      if (this.max_customers !== 0 && this.count_customers >= this.max_customers) {
        btn.disable();
      } else {
        btn.enable();
      }
    }, this);
    this.on('oosstate', function(state) {
      this.is_oss = state;
    }, this);
  },

  setValue: function(v) {
    this.count_customers = 0;
    var to_del = [];
    var i;
    this.items.each(function(c) {
      if ('fieldset' == c.xtype) {
        to_del.push(c);
      }
    });
    for (i = 0; i < to_del.length; i++) {
      this.remove(to_del[i]);
      to_del[i].destroy();
    }
    for (i = 0; i < v.length; i++) {
      if (v[i]) {
        this.add(this.createCustomer(v[i]));
      }
    }
    this.doLayout();
  },

  createCustomer: function(c) {
    this.count_customers++;
    var id = Ext.id();
    if (!c) {
      c = {
        id: Main.contragent.id || 0,
        address: Main.contragent.legal_address || '-',
        full_name: Main.contragent.full_name || '-'
      }
    } else {
      if (c.contragent_representative_id) {
        c.id = c.contragent_representative_id;
      }
      if (c.lot_customer_id) {
        c.id = c.lot_customer_id;
      }
    }
    this.fireEvent('addcustomer', c.id);
    var items = [
      {
        fieldLabel: 'Наименование организации',
        html: c.full_name
      },
      {
        fieldLabel: 'Местонахождение',
        html: c.address
      }
    ];
    items.push({
      xtype: 'Application.components.combo',
      fieldLabel: 'Способ закупки по классификатору ЕИС',
      store: getPurchaseMethodStore(c.id),
      valueField: 'code',
      displayField: 'name',
      name: 'purchase_method_code',
      hiddenName: 'purchase_method_code',
      anchor: '100%',
      mode: 'local',
      editable: false,
      hidden: !this.is_oss || Main.contragent.id == c.id,
      disabled: !this.is_oss || Main.contragent.id == c.id,
      triggerAction: 'all',
      listWidth: 600,
      tooltipTpl: '{name}',
      value: c.purchase_method_code,
      qtipConfig: {
        html: 'При выборе способа закупки обратите внимание на то, чтобы он был включен Вами в ЕИС' +
        ' в Положение о закупках. После обновления версии ЕИС интеграция стала возможна, только если' +
        ' способ закупки присутствует в Положении о закупках. Слева от наименования способа в списке' +
        ' выведен его порядковый номер и код в ЕИС, а также значок (+) или (-), чтобы Вы могли ориентироваться' +
        ' при проверке. Порядковый номер Вы можете видеть в справочнике Способы закупки в ЛК в ЕИС в' +
        ' соответствующей колонке. Код виден в адресной строке браузера при просмотре данного способа' +
        ' закупки в ЛК в ЕИС. Знак (+) означает, что способ закупки включен в Положение о закупках,' +
        ' а (-) - что у нас нет данных о его включении в Положение. Информация о Положении о закупках ' +
        'обновляется в рамках ежесуточной выгрузки. Пожалуйста, будьте внимательны при выборе способа закупки.',
        autoHide: false,
        applyTipTo: 'label'
      },
      plugins: [Ext.ux.plugins.ToolTip],
      listeners: {
        beforerender: function(cmp) {
          if (!cmp.hidden) {
            cmp.getStore().load({
              callback: function() {
                if (!Ext.isEmpty(cmp.getValue())) {
                  cmp.setValue(cmp.getValue());
                }
              }
            });
          }
        }
      }
    });
    items.push({
      xtype: 'button',
      text: 'Удалить заказчика',
      cmpId: id,
      scope: this,
      handler: function(cmp) {
        //noinspection JSPotentiallyInvalidUsageOfThis
        this.count_customers--;
        this.remove(Ext.getCmp(cmp.cmpId));
        this.doLayout();
      }
    });

    var fieldset = new Ext.form.FieldSet({
      xtype: 'fieldset',
      id: id,
      customer: c,
      name: 'lot_customers[]',
      defaults: {
        border: false
      },
      labelWidth: 300,
      layout: 'form',
      style: 'margin-bottom: 0; padding-top: 6px;',
      items: items,
      getValue: function() {
        var purchase = this.find('name', 'purchase_method_code');
        if (purchase.length && !purchase[0].disabled) {
          this.customer.purchase_method_code = purchase[0].getValue();
        }
        return this.customer;
      }
    });
    fieldset.relayEvents(this, ['oosstate']);
    fieldset.on('oosstate', function(state) {
      var purchase = this.find('name', 'purchase_method_code');
      if (purchase.length) {
        if (state &&  Main.contragent.id != c.id) {
          purchase[0].enable();
          purchase[0].show();
        } else {
          purchase[0].disable();
          purchase[0].hide();
        }
      }
    });
    return fieldset;
  },

  eachCustomer: function(callback) {
    if (!Ext.isFunction(callback))
      return false;
    this.items.each(function(item) {
      if (item.customer) {
        if (false === callback(item)) {
          return false;
        }
      }
      return true;
    });
    return true;
  },

  isCustomerExists: function(id) {
    var found = false;
    this.eachCustomer(function(i) {
      if (i.customer.id == id) {
        found = true;
        return false;
      }
    });
    return found;
  }
});
