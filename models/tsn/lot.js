Application.models.Tsn_Lot = {
  getLotTemplates : function() {
    var lotTemplates = {
      /*'lot_documentation'     : '<ul class="lot-documentation"><tpl for="lot_documentation">'
                              + '  <li><a href="/files/{name}">{name}</a> — {descr}</li>'
                              + '</tpl></ul>',*/
      'evalution_crietries'       : new Ext.XTemplate(''
                                + '<tpl if="values.evalution_crietries">'
                                +   '<div class="lot-doc-requirements">{evalution_crietries}</div>'
                                + '</tpl>'),
      'start_price'           : new Ext.XTemplate('<tpl if="start_price">'+
                                  '{[Ext.util.Format.formatPrice(values.start_price)]}'+
                                '</tpl>'+
                                '<tpl if="!start_price">не установлено</tpl>')
    };
    return lotTemplates;// lotTemplates
  },

  getLotPanelItems : function(proc, lotTemplates, mode) {
    var items = [];
    var reqPanel;

    if(!mode) mode='full';

    if(mode=='withproc'|| mode=='withproc-short') {
      var procedureFields = {
        'registry_number'             : 'Номер процедуры:',
        'title'                       : 'Наименование процедуры:',
        'procedure_type_vocab'        : 'Форма торгов:',
        'org_full_name'               : 'Организатор:',
        'date_published'              : 'Дата публикации:'
      }

      items.push({
        xtype       : 'Application.components.keyValuePanel',
        title          : 'Cведения о процедуре',
        autoHeight  : true,
        style     : 'margin: 5px 5px 0px 5px;',
        fields      : procedureFields,
        templates   : {date_published: Ext.util.Format.localDateOnlyRenderer},
        values      : proc
      });
    }

    var priceFields = {};
    priceFields.lot_unit_name = 'Полное наименование товара:';
    priceFields.start_price = 'Начальная цена:';
    priceFields.currency_vocab ='Валюта:';
    priceFields.description = 'Описание товара:';
    priceFields.quantity = 'Количество:';
    priceFields.min_quantity = 'Минимальное количество:';
    priceFields.okei_id = 'Единица измерения:';
    priceFields.discount_period = 'Срок для автоматической переоценки:';
    priceFields.discount_percent = 'Размер скидки при автоматической переоценке:';

    var pricePanel = {
        xtype     : 'fieldset',
        title     : 'Сведения о товаре',
        style     : 'margin: 5px 5px 0px 5px;',
        items     : []
      };

    pricePanel.items.push({
      xtype         : 'Application.components.keyValuePanel',
      autoHeight  : true,
      border: false,
      style: 'margin: 0px; padding: 0px;',
      fields        : priceFields,
      templates   : lotTemplates,
      fieldsShowAlways: ['start_price'],
      values        : proc
    });
    items.push(pricePanel);
    
    if ( !Ext.isEmpty(proc.nomenclature)  && mode=='full') {
      var nomenclaturePanel = {
        xtype     : 'fieldset',
        title     : 'Классификатор ОКДП',
        style     : 'margin: 5px; padding-bottom: 5px;',
        items     : []
      };

      for(var n=0; n<proc.nomenclature.length; n++) {
        nomenclaturePanel.items.push({
          html: proc.nomenclature[n].full_name
        });
      }
      items.push(nomenclaturePanel);
    }
    if ( !Ext.isEmpty(proc.lot_unit_pictures) && mode=='full') {
      items.push({
        title: 'Фото товара',
        xtype: 'Application.components.imageGalleryPanel',
        parent: this,
        files: proc.lot_unit_pictures,
        editable: false
      });
    }
    
    
    if ( !Ext.isEmpty(proc.lot_unit_documents) && mode=='full') {
      items.push({
        xtype: 'Application.components.filelistPanel',
        title: 'Документация о товаре:',
        cls: 'lot-documents',
        files: proc.lot_unit_documents,
        withHash: false,
        style     : 'margin: 5px 5px 0px 5px;'
      });
    }
    
    
    
    if ( !Ext.isEmpty(proc.evaluation_criteries) && mode=='full') {

      reqPanel = {
        xtype     : 'fieldset',
        title     : 'Требования к покупателям и критерии оценки предложений',
        style     : 'margin: 5px 5px 0px 5px;',
        items     : []
      };

      reqPanel.items.push({
        xtype         : 'Application.components.keyValuePanel',
        autoHeight  : true,
        border: false,
        style: 'margin: 0px; padding: 0px;',
        templates   : lotTemplates,
        fields: {
          buyer_requirements  : 'Требования к покупателям:',
          evalution_criteries : 'Критерии оценки предложений: '
        },
        values        : proc
      });
      items.push(reqPanel);
    }


    if ( !Ext.isEmpty(proc.address) && mode=='full') {
      var placePanel = {
        xtype     : 'fieldset',
        title     : 'Адрес местонахождения товара',
        style     : 'margin: 5px 5px 0px 5px;',
        items     : []
      };

      placePanel.items.push({
        xtype         : 'Application.components.keyValuePanel',
        autoHeight  : true,
        border: false,
        style: 'margin: 0px; padding: 0px;',
        fields        : {
          address_string     : 'Адрес местонахождения товара:'
        },

        values        : proc
      });
      items.push(placePanel);
    }
    
    if ( !Ext.isEmpty(proc.lot_documentation) && mode=='full') {
      items.push({
        xtype: 'Application.components.filelistPanel',
        title: 'Проект договора и прочая сопроводительная документация:',
        cls: 'lot-documents',
        files: proc.lot_documentation,
        withHash: false,
        style     : 'margin: 5px 5px 0px 5px;'
      });
    }
    
    return items;
  }

}