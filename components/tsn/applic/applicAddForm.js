Ext.define('Application.components.applicAddForm', {
  extend: 'Application.components.TsnApplic',

  initComponent: function() {

    Application.components.applicAddForm.superclass.initComponent.call(this);

    this.sign_id = Ext.id();
    this.grid_id = Ext.id();
    this.total_id = Ext.id();
    this.price_id = Ext.id();
    this.count_id = Ext.id();
    this.place_id = Ext.id();
    this.current = {
      place: 0,
      best: 0,
      reserve: 0
    };

    this.on('beforerender', function() {
      this.loadProcedureData(this.procedure_id);
      /*this.loadApplicationData(null, Main.contragent.id);*/
    });

    this.addButton({
      text: 'Подать предложение',
      id: this.sign_id,
      formBind: true,
      handler: function() {
        this.validateQuantity(function() {
          this.performSave(this.sign.createDelegate(this))
        }.createDelegate(this));
      },
      scope: this
    });

    this.on('procloaded', function(procedure) {
      var applicFields = [];
      if (this.isAuction(procedure)) {

        var next = procedure.date_next_offer;
        var timeleft = Ext.isEmpty(next) ? 'Не определено' : Ext.util.Format.formatInterval((new Date(next) - new Date()) / 1000);
        var timeend = Ext.isEmpty(next) ? 'Не определено' : Ext.util.Format.localDateRenderer(next);

        this.add({
          xtype: 'grid',
          id: this.grid_id,
          title: 'Уже поданные предложения',
          autoHeight: true,
          store: this.getStore(procedure),
          colModel: new Ext.grid.ColumnModel({
            defaults: {
              menuDisabled: true,
              sortable: false
            },
            columns: [
              new Ext.grid.RowNumberer(),
              {header: 'Место', dataIndex: 'place', width: 50},
              {header: 'Рейтинг', dataIndex: 'rating', width: 50},
              {header: 'Регион покупателя', dataIndex: 'region', width: 200},
              {header: 'Дата', dataIndex: 'date_published', renderer: Ext.util.Format.dateRenderer('d.m.Y H:i')},
              {header: 'Количество', dataIndex: 'quantity'},
              {header: 'Цена', dataIndex: 'price', renderer: Ext.util.Format.formatPrice},
              {header: 'Общая сумма', dataIndex: 'sum', renderer: Ext.util.Format.formatPrice},
              {header: 'Остаток', dataIndex: 'remains'}
            ]
          }),
          viewConfig: {
            forceFit: true
          },
          loadMask: true
        });
        applicFields.push({
          xtype: 'displayfield',
          fieldLabel: 'Осталось времени для подачи предложения',
          value: timeleft
        });
        applicFields.push({
          xtype: 'displayfield',
          fieldLabel: 'Расчетная дата и время окончания приема предложений',
          value: timeend
        });
        applicFields.push(Ext.apply(this.getQuantityField(this.count_id, procedure), {
          listeners: {
            scope: this,
            change: this.setSum,
            blur: function(field) {
              this.setPlace(field, procedure)
            }
          }
        }));
        applicFields.push(Ext.apply(this.getPriceField(this.price_id, procedure), {
          listeners: {
            scope: this,
            change: this.setSum,
            blur: function(field) {
              this.setPlace(field, procedure)
            }
          }
        }));
        applicFields.push({
          xtype: 'displayfield',
          id: this.total_id,
          fieldLabel: 'Общая сумма к оплате'
        });
        applicFields.push({
          xtype: 'displayfield',
          id: this.place_id,
          fieldLabel: 'Место данного предложения в соответствии с системой ранжирования предложений',
          value: 0
        });
      }

      if (this.isFixprice(procedure)) {
        applicFields.push(this.getQuantityField(this.count_id, procedure));
      }

      this.add({
        xtype: 'fieldset',
        title: 'Заявка',
        layout: 'form',
        labelWidth: 300,
        items: applicFields
      });
      this.doLayout();
    });
  },

  sign: function(result) {
    var tpl = getTsnApplicSignatureTemplate();
    var obj = this.procedure;
    obj.form = {
      price: this.getValues().price || this.procedure.price,
      quantity: this.getValues().quantity
    };
    var win = new Application.components.promptWindow({
      cmpType: 'Application.components.SignatureForm',
      parentCmp: this,
      cmpParams: {
        api: RPC_tsn.Applic.sign,
        signatureText: tpl.applyTemplate(obj),
        signatureTextHeight: 250,
        useFormHandler: false,
        success_fn: function(resp) {
          win.close();
          echoResponseMessage(resp);
          if (this.isAuction(this.procedure))
            Ext.getCmp(this.grid_id).getStore().load();
          else
            redirect_to('tsn/procedure/index');
        }.createDelegate(this),
        items: [
          {
            xtype: 'hidden',
            name: 'application_id',
            value: result.applic.id
          }
        ]
      }
    });
    win.show();
  },

  getStore: function(procedure) {
    return new Ext.data.DirectStore({
      directFn: RPC_tsn.Applic.list,
      paramsAsHash: true,
      root: 'rows',
      idProperty: 'id',
      totalProperty: 'totalCount',
      messageProperty: 'message',
      autoLoad: true,
      autoSave: false,
      fields: [
        'place', 'rating', 'region',
        {name: 'date_published', type: 'date', dateFormat: 'c'},
        'quantity', 'price', 'sum', 'remains'
      ],
      baseParams: {
        procedure_id: procedure.id
      },
      listeners: {
        scope: this,
        load: this.storeLoaded
      }
    });
  },

  getQuantityField: function(id, procedure) {
    return {
      xtype: 'Application.components.quantityField',
      id: id,
      name: 'quantity',
      allowFloat: this.isFloat(procedure),
      fieldLabel: 'Количество приобретаемых единиц:' + REQUIRED_FIELD,
      minValue: procedure.min_quantity,
      minValueText: 'Количество приобретаемых единиц не может быть ниже минимально возможного количества',
      maxValue: procedure.available_quantity,
      maxValueText: 'Количество приобретаемых единиц не может быть больше чем общее заявленное по лоту',
      value: procedure.min_quantity
    };
  },

  getPriceField: function(id, procedure) {
    return {
      xtype: 'Application.components.priceField',
      id: id,
      name: 'price',
      allowBlank: false,
      minValue: procedure.price,
      minValueText: 'Цена предложения не может быть ниже цены лота',
      fieldLabel: 'Предлагаемая стоимость за единицу:' + REQUIRED_FIELD,
      value: procedure.price
    }
  },

  setPlace: function(field, procedure) {
    var store = Ext.getCmp(this.grid_id).getStore();
    store.setBaseParam('current', {
      quantity: Ext.getCmp(this.count_id).getValue(),
      price: Ext.getCmp(this.price_id).getValue(),
      lot_quantity: procedure.quantity,
      lot_price: procedure.price,
      price_criterium: procedure.price_criterium,
      volume_criterium: procedure.volume_criterium
    });
    store.load();
  },

  setSum: function() {
    var price = Ext.getCmp(this.count_id).getValue() * parsePrice(Ext.getCmp(this.price_id).getValue());
    Ext.getCmp(this.total_id).setValue(Ext.util.Format.formatPrice(price));
  },

  validatePlace: function() {
    if (this.current.place >= this.current.best) {
      Ext.Msg.alert('Внимание!', String.format(
        'Вновь подаваемое предложение должно по итогам ранжирования занимать более высокое место, ' +
        'чем предыдущие предложения. Поданное ранее предложение занимает {0} место.', this.current.best));
      return false;
    }
    return true;
  },

  validateQuantity: function(cb) {
    if (!this.validatePlace())
      return;
    var tmp = this.procedure.available_quantity - this.current.reserve;
    var avail = tmp >= 0 ? tmp : 0;
    var quantity = Ext.getCmp(this.count_id).getValue();
    var place = Ext.getCmp(this.place_id).getValue();
    if (place != 1 && avail < quantity) {
      var msg = String.format(
        'Ваше предложение не является лучшим. ' +
        'В случае если продавец примет решение о заключении ' + t('контракта') + ' с покупателями, ' +
        'подавшими предложения, получающими на текущий момент более высокие места по итогам ранжирования, ' +
        'вы сможете приобрести не более {0} {1} товара. Все равно подать предложение?', avail, this.procedure.okei_id);
      Ext.Msg.confirm('Внимание!', msg, function(b) {
        if ('yes' == b) {
          cb();
        }
      });
    } else cb();
  },

  storeLoaded: function(store) {
    if (store.getTotalCount())
      Ext.getCmp(this.grid_id).show();
    else
      Ext.getCmp(this.grid_id).hide();
    if (Ext.isDefined(store.reader.jsonData.current)) {
      this.current = store.reader.jsonData.current;
      Ext.getCmp(this.place_id).setValue(this.current.place);
    }
  }
});
