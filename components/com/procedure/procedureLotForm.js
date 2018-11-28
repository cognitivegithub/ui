
Ext.define('Application.components.procedureLotForm', {
  extend: 'Ext.panel.Panel',
  autoHeight: true,
  parent: null,
  frame: true,
  lotNumber: 1,
  initComponent: function() {
    var component = this;
    this.ids = {
      docs: Ext.id(),
      delivery: Ext.id(),
      subject: Ext.id(),
      reqs: Ext.id()
    };

    var subject = new Application.components.procedureSubjectForm({
      title: 'Предмет договора',
      id: this.ids.subject,
      value: this.value,
      module_type: 'com'
    });

    var reqs = new Application.components.appreqForm({
      title: 'Требования к заявителям',
      id: this.ids.reqs,
      value: this.value
    });

    var customers = new Application.components.procedureCustomersForm({
      title: 'Заказчики',
      name: 'lot_customers',
      max_customers: Main.contragent.customer_profile_id == 2 ? 99 : 0,
      is_oss: Main.contragent.oos_send
    });

    addEvents(this, [
      'procedurechanged',
      'addcustomer',
      'oosstate',
      'stageschanged',
      'startpricechanged',
      'onEditing'
    ]);

    Ext.apply(this, {
      items: [{
        xtype: 'tabpanel',
        bodyCssClass: 'x-panel-body',
        activeTab: 0,
        cls: 'deepsubpanel',
        border: true,
        header: true,
        defaults: {
          frame: false,
          style: 'padding-left: 5px; padding-right: 5px;'
        },
        items: [
          customers,
          subject,
          {
            title: 'Условия поставки',
            xtype: 'Application.components.deliveryForm',
            value: this.value?this.value.lot_delivery_places:null,
            id: this.ids.delivery
          },
          reqs,
          {
            title: t('Документация'),
            name: 'lot_documentation',
            id: this.ids.docs,
            procedure: this.parent,
            xtype: 'Application.components.auctiondocForm'
          }
        ]
      }],
      listeners: {
        beforeclose: function() {
          Ext.Msg.confirm('Подтверждение',
            'Вы действительно хотите удалить этот лот ('+component.title+')?',
            function(b){
              if ('yes'==b) {
                component.allowDelete = true;
                if (component.parent) {
                  component.parent.fireEvent('removerequest', component.parent, component);
                }
              }
          });
          return false;
        },
        procedurechanged: function(p) {
          //alert('Процедура стала '+p);
        },
        stageschanged: function(st) {
          //alert('Стадий стало '+st);
        },
        peretorg : function(st) {
          this.stage = st;
        }
      },
      getValues: function() {
        var v = {number: this.lotNumber};
        if (this.lot_id) {
          v.id = this.lot_id;
        }
        if (this.status) {
          v.status = this.status;
        }

        collectComponentValues(this, v);
        v.guarantee_application = v.guarantee_application||null;
        v.guarantee_contract = v.guarantee_contract||null;
        v.guarantee_advance = v.guarantee_advance||null;
        v.guarantee_warranty = v.guarantee_warranty||null;
        return v;
      },
      setValues: function(v) {
        setComponentValues(this, v, true);
        if (v.lot_delivery_places) {
          Ext.getCmp(this.ids.delivery).setValues(v.lot_delivery_places);
        }
        if (v.id) {
          this.lot_id = v.id;
        }
        if (v.status) {
          this.status = v.status;
        }
        Ext.getCmp(this.ids.subject).setValues(v);
        Ext.getCmp(this.ids.reqs).setValues(v);
        //Ext.getCmp(this.ids.reqs).fireEvent('startpricechanged', v.start_price);
      }
    });
    Application.components.procedureLotForm.superclass.initComponent.call(this);
    if (this.parent) {
      this.parent.relayEvents(customers, ['addcustomer']);
      this.parent.relayEvents(subject, ['startpricechanged']);
    }
    customers.relayEvents(this, ['oosstate']);
    subject.relayEvents(this, ['procedurechanged', 'stageschanged','onEditing', 'lotpricechanged']);
    reqs.relayEvents(this, ['procedurechanged', 'stageschanged', 'lotpricechanged']);
    reqs.relayEvents(subject, ['startpricechanged']);
    autoSetValue(this);
    if (this.status==Application.models.Procedure.statuses.cancelled) {
      this.items.each(function(i) {
        i.setDisabled(true);
      })
    }
  },
  setLotNumber: function(n) {
    this.lotNumber = n;
    var title = Main.config.show_lot_tabs_add ? 'Лот ' + n : 'Лот';
    if (this.rendered) {
      this.setTitle(title);
    } else {
      this.title = title;
    }
  },
  getLotNumber: function() {
    return this.lotNumber;
  },
  setPrice: function(price) {
    return Ext.getCmp(this.ids.subject).setStartPrice(price);
  },
  getPrice: function() {
    return Ext.getCmp(this.ids.subject).getStartPrice();
  },
  getSubject: function() {
    return Ext.getCmp(this.ids.subject).getSubject();
  },
  validate: function(procedure_params) {
    var valid = {success: true, msg: []};
    if (!this.getSubject()) {
      valid.msg.push('Ошибка: у лота не указан предмет договора. '
        + 'Для публикации процедуры перейдите на вкладку «Лот» и укажите данные о лоте.');
      valid.success = false;
      valid.fatal = true;
    }
    var docs = {};
    collectComponentValues(Ext.getCmp(this.ids.docs), docs);
    if (!docs.lot_documentation || !docs.lot_documentation.length) {
      valid.msg.push('Предупреждение: у лота '+this.lotNumber+' отсутствует документация.');
      valid.success = false;
    }

    if (Ext.isDefined(procedure_params) && Ext.isDefined(procedure_params.send_to_oos) && procedure_params.send_to_oos) {
      var subject = Ext.getCmp(this.ids.subject);
      var getComponentByName = function(from, name) {
        var a = from.find('name', name);
        return a.length ? a[0] : false;
      };

      if (subject.getProductList().getProductsItems().getCount() == 0) {
        valid.msg.push('Ошибка: для корректной передачи данных в ЕИС необходио указать хотя бы один товар для лота');
        valid.success = false;
        valid.fatal = true;
      } else {
        subject.getProductList().getProductsItems().each(function(product, idx) {
          var nameCmp = getComponentByName(product, 'name')
          if (!nameCmp || !nameCmp.validate()) {
            valid.msg.push('Ошибка: необходимо заполнить наименование товара/услуги');
            valid.success = false;
            valid.fatal = true;
          }
          var quantityCmp = getComponentByName(product, 'quantity');
          var okeiCmp = getComponentByName(product, 'okei_code');
          if (quantityCmp && !Ext.isEmpty(quantityCmp.getValue())) {
            if (okeiCmp && Ext.isEmpty(okeiCmp.getValue())) {
              var err = String.format("Ошибка: необходимо указать единицу измерения для '{0}'", nameCmp.getValue());
              okeiCmp.markInvalid(err);
              valid.msg.push(err);
              valid.success = false;
              valid.fatal = true;
            }
          } else {
            okeiCmp.clearInvalid();
          }
        });
      }
    }
    valid.msg = valid.msg.join('<br/>\n');
    return valid;
  }
});
