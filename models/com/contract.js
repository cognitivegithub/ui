Application.models.Contract = {
  FILE_TYPE: {
    draft: 1,
    supplier_guarantee: 3,
    other: 7,
    discrepancy: 9,
    repudiation: 11,
    supplier_other: 12
  },
  renderTip: function(text, params) {
    params = params||{};
    return '<sup><span style="cursor:pointer; text-decoration:underline; color:'+(params.color||'darkblue')+';'+
           ' white-space:nowrap; font-weight:normal;" ext:qtip="'+text+'">[?]</span></sup>';
  },
  findRecordById: function(id, store) {
    for (var i=0; i<store.length; i++) {
      if (store[i].id && store[i].id == id) {
        return store[i];
      }
    }
    return null;
  },
  redirectToContract: function(customer, supplier, url) {
    if (customer) {
      url += '/customer/'+customer;
    }
    if (supplier) {
      url += '/supplier/'+supplier;
    }
    redirect_to(url);
  },
  renderCompany: function(company_id, companies) {
    if (!company_id) {
      return '-';
    }
    for (var i=0; i < companies.length; i++) {
      if (company_id == companies[i]['id']) {
        return companies[i]['full_name'];
      }
    }
    return '?';
  },
  renderSupplier: function(supplier_id, suppliers) {
    return this.renderCompany(supplier_id, suppliers);
  },
  renderCustomer: function(customer_id, customers, link) {
    var str = this.renderCompany(customer_id, customers);
    if (link) {
      return '<a href="'+getContractLink(customer_id)+'">'+str+'</a>';
    }
    return str;
  },
  filesCount: function(files,type, only_actual, only_signed) {
    var cnt = 0;
    Ext.each(files, function(i){
      if (only_actual && !i.is_last_version) {
        return;
      }
      if (only_signed && !i.eds) {
        return;
      }
      if (i.type_id == type) {
        cnt++;
      }
    })
    return cnt;
  },
  checkUserIsContractor: function(is_contractor) {
    if (!is_contractor) {
      Ext.MessageBox.alert("Недостаточно прав доступа", "Добавлять, заменять и подписывать файлы могут только пользователи с привилегией «Пользователь уполномоченный на подписание договора»");
    }
    return !!is_contractor;
  },
  showSupplierRecs: function(supplier_id, suppliers) {
    var supplier = this.findRecordById(supplier_id, suppliers);
    var items =[
      {
        html: '<b>'+supplier.full_name+'</b>'
      }, {
        html: ' ИНН:' + supplier.inn + ' КПП: ' + supplier.kpp
      }, {
        html: 'Юридический адрес: ' + supplier.address_main
      }, {
        html: 'Почтовый адрес: ' + supplier.address_post
      }, {
        html: 'Телефон: ' + supplier.phone + (supplier.fax?(', FAX: ' + supplier.fax):'')
      }, {
        html: 'Банковские реквизиты: ' + supplier.bank
      }, {
        html: 'БИК: ' + supplier.bik
      },{
        html: 'Рас/с: ' + supplier.account_ras
      }, {
        html: 'Кор/с: ' + supplier.account_cor
      }
    ];
    if (supplier.account_lic) {
      items.push({
        html: 'Лиц/с: ' + supplier.account_lic
      });
    }
    var orgWindow = new Ext.Window({
      autoHeight: true,
      width: 600,
      title: 'Реквизиты победителя',
      constrain: true,
      modal: true,
      items: [{
        xtype: 'panel',
        width: '100%',
        border: false,
        autoHeight: true,
        frame: true,
        items: [{
            xtype: 'fieldset',
            autoHeight: true,
            border: false,
            layout: 'form',
            cls: 'normal-text',
            defaults: {
              style: 'margin-bottom: 5px;'
            },
            items: items
          }]
      }],
      buttonAlign: 'center',
      buttons: [{
          text: 'Закрыть',
          handler: function(){orgWindow.close();}
        }]
    });
    orgWindow.show();
  },
  renderInfo: function(title, value) {
    return '<div class="info-text"><b>'+title+'</b>: '+value+'</div>'
  },
  renderLotInfo: function(params) {
    var lot = params.lot;
    var customers = params.customers;
    var suppliers = params.suppliers;
    var current_customer = params.current_customer;
    var current_supplier = params.current_supplier;
    var currency = params.currency;
    var url = 'com/contract/index/lot/' + lot.id;
    var renderInfo = this.renderInfo;

    var infos = {
      registry_number: 'Реестровый номер процедуры',
      title: 'Наименование лота',
      price: 'Начальная (максимальная) цена договора'
    };

    var templates = {
      price: new Ext.XTemplate('<tpl if="price">'+
                                  '{[Ext.util.Format.formatPrice(values.price)]} '+currency._name+
                                '</tpl>'),
      final_price: new Ext.XTemplate('<tpl if="final_price">'+
                                  '{[Ext.util.Format.formatPrice(values.final_price)]} '+currency._name+
                                '</tpl>')
    };

    var values = {};
    var i;
    var t;
    var winner = this.findRecordById(lot.winner_id, suppliers);
    var tmp_registry_number = lot.registry_number;
    lot.registry_number = lot.registry_number+', лот № '+lot.number;
    for (i in infos) {
      if (!infos.hasOwnProperty(i)) {
        continue;
      }
      values[i]=lot[i];
    }
    lot.registry_number = tmp_registry_number;

    infos.customer = 'Заказчик';
    values.customer = this.renderCustomer(current_customer, customers);
    if (winner) {
      infos.winner = 'Заявитель, признанный победителем в торгах по данному лоту';
      values.winner = this.renderSupplier(winner.id, suppliers);
      infos.final_price = 'Последнее ценовое предложение, поданное победителем';
      values.final_price = winner.price||lot.start_price;
      //str += renderInfo('Номер карточки договора', lot.registry_number+'_'+current_customer);
    }
    infos.guarantee_contract = 'Требование обеспечения исполнения договора';
    values.guarantee_contract = lot.guarantee_needed?'установлено':'не установлено';

    if (null!==params.agreement_required && undefined!==params.agreement_required) {
      infos.agreement_required = 'Согласование договора';
      values.agreement_required = params.agreement_required?'требуется':'не требуется';
    }
    var contract_types = {
      0: 'не заключается',
      1: 'заключается в электронной форме',
      2: 'заключается в письменной форме'
    }

    if (null!==params.signature_required && undefined!==params.signature_required) {
      infos.signature_required = 'Договор';
      values.signature_required = contract_types[params.signature_required]||'?';
    }

    /*if (7!=lot.status) {
      infos.comment = 'Примечание';
      values.comment = 'процедура не на этапе подписания договора';
    } else {
      t = {
        '1': 'предоставления проекта договора',
        '2': 'подписи проекта договора поставщиком',
        '3': 'подписи договора заказчиком'
      }
    }*/
    var info = {
      xtype       : 'Application.components.keyValuePanel',
      title: 'Информация о лоте',
      anchor: '100%',
      autoHeight  : true,
      fields      : infos,
      templates   : templates,
      values      : values,
      style: 'margin: 5px 5px 0px',
      defaults: {
        xtype: 'panel'
      }
    }
    return info;
  },
  renderParticipants: function(params) {
    var lot = params.lot;
    var customers = params.customers;
    var suppliers = params.suppliers;
    var current_customer = params.current_customer;
    var current_supplier = params.current_supplier;
    var currency = params.currency;
    var url = 'com/contract/index/lot/' + lot.id;
    var i, str, info = [];
    var suppliers_store = [];
    var renderInfo = this.renderInfo;
    var t;

    for (i=0; i<suppliers.length; i++) {
      t = suppliers[i];
      if (!t.position) {
        continue;
      }
      str = '' + (t.position||'?') + ': ' + t.full_name + ' (' + Ext.util.Format.formatPrice(t.price||lot.start_price);
      if (t.pref_price && t.price!=t.pref_price) {
        str += '/'+Ext.util.Format.formatPrice(t.pref_price);
      }
      str += ' ' + currency._name +')'
      suppliers_store.push([t.id, str, t.position||999]);
    }
    var customers_store = [];
    for (i=0; i<customers.length; i++) {
      t = customers[i];
      str = t.full_name;
      customers_store.push([t.id, str]);
    }
    suppliers_store.sort(function(a,b){return a[2]-b[2];});
    customers_store.sort(function(a,b){return a[0]-b[0];});
    var renderSelector = function (t) {
      return {
        layout: 'form',
        frame:false,
        border: false,
        labelWidth: 400,
        width: '100%',
        items: [{
            fieldLabel: renderInfo(t.title, ''),
            labelSeparator: '',
            xtype: 'combo',
            editable: false,
            anchor: '-20',
            store: t.store,
            triggerAction: 'all',
            hiddenName: Ext.id(),
            value: t.value,
            mode: 'local',
            listeners: {
              select: t.handler
            }
          }]
      };
    };
    if (customers_store.length>0) {
      info.push(renderSelector({
        title: 'Заказчики по лоту' + this.renderTip('Выберите из списка заказчика для просмотра документов, относящихся к нему'),
        store: customers_store,
        value: current_customer,
        handler: function(combo, record) {
          if (record.data.field1 == current_customer) {
            return;
          }
          Application.models.Contract.redirectToContract(record.data.field1, current_supplier, url);
        }
      }));
    }
    if (suppliers_store.length>0) {
      info.push(renderSelector({
        title: 'Участники торгов, допущенные к заключению договора' + this.renderTip('Выберите из списка участника для просмотра документов, относящихся к нему'),
        store: suppliers_store,
        value: current_supplier,
        handler: function(combo, record) {
          if (record.data.field1 == current_supplier) {
            return;
          }
          Application.models.Contract.redirectToContract(current_customer, record.data.field1, url);
        }
      }));
    }
    return info;
  },
  showContractEds: function(eds_text) {
    var edsWin = new Ext.Window({
      autoHeight: true,
      width: 600,
      title: 'Данные ЭП',
      constrain: true,
      modal: true,
      items: [
      {
        xtype: 'panel',
        width: '100%',
        border: false,
        autoHeight: true,
        frame: true,
        bodyCssClass: 'subpanel-top-padding',
        items: [{
          width: '99%',
          height: 350,
          xtype: 'textarea',
          readOnly: true,
          value: eds_text
        }]
      }],
      buttonAlign: 'center',
      buttons: [{
        text: 'Закрыть',
        handler: function(){edsWin.close();}
      }]
    });
    edsWin.show();
  },
  showEdsInfo: function(eds_text) {
    var edsWin = new Ext.Window({
      autoHeight: true,
      width: 600,
      title: 'Данные ЭП',
      constrain: true,
      modal: true,
      items: [
      {
        xtype: 'panel',
        width: '100%',
        border: false,
        autoHeight: true,
        frame: true,
        bodyCssClass: 'subpanel-top-padding',
        html: eds_text
      }],
      buttonAlign: 'center',
      buttons: [{
        text: 'Закрыть',
        handler: function(){edsWin.close();}
      }]
    });
    edsWin.show();
  }
}