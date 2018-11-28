Ext.ns('Main.templates');

function getProcedureDataTemplate() {
  var procedureDataTemplate = new Ext.XTemplate(
    '<table class="tpltbl">'+
    '<tr><th>Номер процедуры:</th><td>' +
    "<tpl if='registry_number'>{registry_number}</tpl>" +
    "<tpl if='!registry_number'>{id}</tpl>" +
    '</td></tr>' +
    '<tr><th>Наименование процедуры:</th><td>{title}</td></tr>'+
    '<tr><th>Форма торгов:</th><td>{procedure_type_vocab}'+
    '<tpl if="values.with_prequalification"> c проведением квалификационного отбора</tpl>'+
    '</td></tr>'+
    '<tr><th>Организатор:</th><td>{org_full_name}</td></tr>'+
    '<tr><th>Контактные данные организатора:</th><td>{contact_phone}, {contact_email}</td></tr>'+
    '<tr><th>Контактное лицо:</th><td>{contact_person}</td></tr>'+
    '<tr><th>Дата публикации извещения:</th><td>{[fm.localDateOnlyRenderer(values.date_published)]}</td></tr>'+
    '<tpl if="values.date_end_registration"><tr><th>Дата и время окончания подачи заявок:</th><td>{[fm.localDateText(values.date_end_registration)]}</td></tr></tpl>'+
    '<tpl if="values.date_applic_opened && Application.models.Procedure.isStatusExists(values.procedure_type, 3) && [PROCEDURE_TYPE_QUOTATION_REQ].indexOf(values.procedure_type)==-1"><tr><th>Дата публикации протокола вскрытия конвертов:</th><td>{[fm.localDateText(values.date_applic_opened)]}</td></tr></tpl>'+
    '<tpl if="values.date_end_first_part_review"><tr><th>Дата окончания рассмотрения:</th><td>{[fm.localDateText(values.date_end_first_part_review)]}</td></tr></tpl>'+
    '</table>');

  return procedureDataTemplate;
}

function getRequestInfoTemplate() {
  return new Ext.XTemplate('<table class="tpltbl">'+
    '<tr><th>Текст запроса:</th><td>{request_message}</td></tr>'+
    '<tr><th><tpl if="supplier_name">Участник, получивший запрос</tpl></th>' +
    '<td><tpl if="supplier_name">{supplier_name}</tpl></td></tr>' +
    '<tr><th>Приложенные к запросу документы:</th><td><tpl if="values.request_docs">{request_docs}</tpl>' +
    '<tpl if="!values.request_docs">отсутствуют</tpl></td></tr>' +
    '<tpl if="response_message || status==4">' +
    '<tr><th><tpl if="response_message && status != 4">Текст разъяснения</tpl>' +
    '<tpl if="status==4">Основания для отклонения</tpl>:</td><td>' +
    '<tpl if="response_message">{response_message}</tpl>' +
    '<tpl if="status==4 && cancel_reason">{cancel_reason}</tpl>' +
    '<tpl if="!response_message && !cancel_reason">отсутствует</tpl></td></tr>' +
    '<tr><th>Приложенные к разъяснению документы:</th><td><tpl if="values.response_docs">{response_docs}</tpl><tpl if="!values.response_docs">отсутствуют</tpl></td></tr>'+
    '</tpl>'+
    '</table>'
  );
}

function getExplainInfoTemplate() {
  return new Ext.XTemplate('<table class="tpltbl">'+
    '<tr><th>Текст разъяснения:</td><td><tpl if="response_message">{response_message}</tpl><tpl if="!response_message">отсутствует</tpl></td></tr>'+
    '<tr><th>Приложенные к разъяснению документы:</th><td>{response_docs}</td></tr>'
  );
}

function getFileDownloadTemplate() {
  var tpl = '<tpl if="values.short_name!==undefined">' +
    '<a title="{name}" target="_blank" href="{link}">{short_name}</a>' +
    '</tpl>' +
    '<tpl elseif="values.short_name===undefined"> ' +
    '<a target="_blank" href="{link}">{name}</a>' +
    '</tpl>';
  return new Ext.XTemplate(tpl);
}

function getLotDataTemplate() {
  var tpl = '<table class="tpltbl">'+
      '<tr><th>Реестровый номер процедуры</th><td>{procedure_registry_number}</td></tr>'+
      '<tr><th>Номер лота</th><td>{number}</td></tr>'+
      '<tpl if="!shortInfo">'+
      '<tpl if="values.lot_customers!=null">'+
        '<tr><th>Заказчики, с которыми заключается договор</th><td>'+
        '<tpl for="lot_customers">'+
          '{#}. {full_name}. Адрес местонахождения: {address}\n'+
        '</tpl></td></tr>'+
      '</tpl>'+
      '</tpl>'+
      '<tr><th>Предмет договора</th><td>{subject}</td></tr>'+
      '<tr><th>Начальная цена</th><td>{start_price}</td></tr>'+
      '<tr><th>Валюта</th><td>{currency_vocab}</td></tr>'+
      '<tpl if="!shortInfo">'+
      '<tpl if="values.nomenclature!=null">'+
        '<tr><th>Номенклатура лота</th><td>'+'<tpl for="nomenclature">'+'{full_name}; '+'</tpl></td></tr></tpl>'+
        '<tpl if="values.lot_units!=null">'+
          '<tr><th colspan="2">Перечень поставляемых товаров, выполняемых работ, оказываемых услуг</th></tr>'+
          '<tr><td colspan="2"><table class="tplsubtbl">'+
          '<tr><td width="30%">Наименование</td><td width="10%">Количество</td><td width="40%">Характеристики</td></tr>'+
          '<tpl for="lot_units">'+
            '<tr><td>{name}</td><td>{quantity}</td><td>'+
            '<tpl if="values.requirements.length!=0">'+
              '<tpl for="requirements">'+
                '{#}. {requirement} ({type_vocab}): {value}\n'+
              '</tpl></td></tr>'+
            '</tpl>'+
            '<tpl if="values.requirements.length==0">не указаны</tpl>'+
          '</tpl></table>'+
        '</tpl>'+
        '<tpl if="values.lot_delivery_places!=null">'+
        '<tr><th>Место и условия поставки</th><td>'+
        '<tpl for="lot_delivery_places">'+
          'Объем поставки: {quantity}<br>'+
          'Адрес поставки: {address}<br>'+
          'Условия поставки: {term}<br><br>'+
        '</tpl></td></tr></tpl>'+
        '<tr><th>Размер обеспечения заявки на участие</th><td><tpl if="values.guarantee_application==null">не требуется</tpl><tpl if="values.guarantee_application!=null">{guarantee_application}</tpl></td></tr>'+
        '<tr><th>Размер обеспечения исполнения договора</th><td><tpl if="values.guarantee_contract==null">не требуется</tpl><tpl if="values.guarantee_contract!=null">{guarantee_contract}</tpl></td></tr>'+
        '<tr><th>Размер обеспечения возврата аванса</th><td><tpl if="values.guarantee_advance==null">не требуется</tpl><tpl if="values.guarantee_advance!=null">{guarantee_advance}</tpl></td></tr>'+
        '<tr><th>Размер обеспечения гарантийных обязательств</th><td><tpl if="values.guarantee_warranty==null">не требуется</tpl><tpl if="values.guarantee_warranty!=null">{guarantee_warranty}</tpl></td></tr>'+
        '<tpl if="values.lot_doc_requirements!=null">'+
        '<tr><th>Требуемая документация</th><td>'+
        '<tpl for="lot_doc_requirements">'+
          '{#}. {requirement} (основание: {reason}), {application_part}-я часть заявки<br>'+
        '</tpl></td></tr></tpl>'+
      '</tpl>'+
      '</table>';
    var lotDataTemplate = new Ext.XTemplate(tpl);
    return lotDataTemplate;
}

function getTsnApplicSignatureTemplate() {
  var tpl = 'ЗАЯВКА НА УЧАСТИЕ В ПРОЦЕДУРЕ\n\n'+
    'Реестровый номер процедуры: {registry_number}\n' +
    'Форма торгов: {procedure_type_vocab}'+
    '<tpl if="values.procedure.with_prequalification"> c проведением квалификационного отбора</tpl>'+
    '\n'+
    'Краткое наименование процедуры: {title}\n'+
    '\nСВЕДЕНИЯ О ЛОТЕ\n'+
    'Наименование товара: {lot_unit_name}\n'+
    'Валюта: {currency_vocab}\n'+
    'Единица измерения: {okei_id}\n'+
    '\nЗАЯВКА\n'+
    '<tpl if="quantity">Количество: {values.form.quantity}\n</tpl>' +
    '<tpl if="price">Цена: {values.form.price} {currency_vocab_short}\n</tpl>';
  return new Ext.XTemplate(tpl);
}

function getTsnApplicCancelSignatureTemplate() {
  var tpl = 'Заявитель {values.contragent.full_name} удаляет черновик заявки.\n' +
    'Реестровый номер процедуры: {values.procedure.registry_number}\n' +
    'Название процедуры: {values.procedure.title}\n' +
    'Дата и время удаления черновика заявки: {[Ext.util.Format.date(new Date(), \'d.m.Y H:i\')]}';
  return new Ext.XTemplate(tpl);
}

function getTsnProcedureSignatureTemplate() {
  var tpl = 'ИЗВЕЩЕНИЕ О ПРОВЕДЕНИИ ТОРГОВ\n\n'+
    'Форма торгов: {procedure_type_vocab}\n'+
    '<tpl if="values.with_prequalification"> c проведением квалификационного отбора</tpl>'+
    '\n'+
    'Краткое наименование процедуры: {title}\n\n'+
    'ДАННЫЕ ОБ ОРГАНИЗАТОРЕ\n'+
    'Наименование организатора: {org_full_name}\n'+
    'Местонахождение организатора: {org_postal_address}\n'+
    'Контактный телефон: {contact_phone}\n'+
    'Адрес электронной почты: {contact_email}\n'+
    'Ф.И.О.контактного лица: {contact_person}\n'+
    '<tpl if="values.date_published!==undefined">'+
    'Дата публикации: {[fm.localDateOnlyRenderer(values.date_published)]}\n'+
    '</tpl>'+
    '\nСВЕДЕНИЯ О ЛОТЕ\n'+
    'Наименование товара: {lot_unit_name}\n'+
    'Начальная цена: <tpl if="values.start_price">{[fm.price(values.start_price)]}</tpl><tpl if="!values.start_price">не указано</tpl>\n'+
    'Валюта: {currency_vocab}\n'+
    'Количество: {quantity}\n'+
    'Минимальное количество: {[this.processNotRequired(values.min_quantity)]}\n'+
    'Единица измерения: {okei_id}\n'+
    'Описание товара: {lot_unit_description}\n'+
    '<tpl if="values.nomenclature!=undefined">'+
    'Номнклатурные группы:\n'+
    '<tpl for="nomenclature">'+
      '{full_name}\n'+
    '</tpl>'+
    '</tpl>'+
    '<tpl if="values.buyer_requirements">'+
      '\nТРЕБОВАНИЯ К ПОКУПАТЕЛЯМ\n'+
      '{buyer_requirements}\n'+
    '</tpl>'+
    '<tpl if="values.address_string!=undefined">'+
    '\n АДРЕС МЕСТОНАХОЖДЕНИЯ ТОВАРА\n'+
    '{[this.processNotRequired(values.address_string)]}\n'+
    '</tpl>'+
    '<tpl if="values.evaluation_criteries">'+
      '\nКРИТЕРИИ ОЦЕНКИ ЗАЯВОК\n'+
      '{evaluation_criteries}\n'+
    '</tpl>'+
    '<tpl if="values.discount_period!=0">'+
      '\nНАСТРОЙКИ АВТОМАТИЧЕСКОЙ ПЕРЕОЦЕНКИ:\n'+
      'Срок до автоматической переоценки {discount_period} нед.\n'+
      'Размер дисконта переоценки {discount_percent}%\n'+
    '</tpl>'+
    '<tpl if="values.lot_unit_pictures.length!=0">'+
    '\nИЗОБРАЖЕНИЯ ТОВАРА \n'+
     '<tpl for="lot_unit_pictures">'+
      '{#}. {descr} - {name}  (контрольная сумма ГОСТ Р34.11-94: {hash})\n'+
    '</tpl>'+
    '</tpl>'+
    '<tpl if="values.lot_unit_documents.length!=0">'+
    '\nДОКУМЕНТАЦИЯ К ТОВАРУ \n'+
     '<tpl for="lot_unit_documents">'+
      '{#}. {descr} - {name}  (контрольная сумма ГОСТ Р34.11-94: {hash})\n'+
    '</tpl>'+
    '</tpl>'+
    '<tpl if="values.lot_documentation.length!=0">'+
    '\nПРОЕКТ ДОГОВОРА И СОПРОВОДИТЕЛЬНАЯ ДОКУМЕНТАЦИЯ ПО ЛОТУ \n'+
     '<tpl for="lot_documentation">'+
      '{#}. {descr} - {name}  (контрольная сумма ГОСТ Р34.11-94: {hash})\n'+
    '</tpl>'+
    '</tpl>';
  var procedureSignatureTemplate = new Ext.XTemplate(tpl, { processNotRequired : function (v) {if(Ext.isEmpty(v) || v=='null') return 'не указано'; else return v;}});
  return procedureSignatureTemplate;
}


function getProcedureSignatureTemplate(procedure_type) {
  var app_stages_text = 'Порядок рассмотрения заявок: {application_stages} этап(а)\n';
  //var date_applic_opened_text = 'Дата и время окончания срока публикации протокола вскрытия конвертов';
  //var date_end_first_parts_review_text = 'Дата окончания рассмотрения первых частей заявок';
  //var date_end_second_parts_review_text = 'Дата подведения итогов';
  
  var guarantee_advance_text = '<tpl if="values.guarantee_advance">Размер обеспечения возврата аванса: {guarantee_advance}\n</tpl>';
  var guarantee_warranty_text = '<tpl if="values.guarantee_warranty">Размер обеспечения гарантийных обязательств: {guarantee_warranty}\n</tpl>';
  var guarantee_contract_text = '<tpl if="values.guarantee_contract">Размер обеспечения исполнения договора: {[fm.price(values.guarantee_contract)]}\n</tpl>';
  if (procedure_type) {
    if (procedure_type == Application.models.Procedure.type_ids.contest) {
      app_stages_text = '';
      date_end_first_parts_review_text = 'Дата окончания рассмотрения заявок';
    }
    if (procedure_type == Application.models.Procedure.type_ids.quotation) {
      app_stages_text = '';
    }
    if (procedure_type == Application.models.Procedure.type_ids.pricelist) {
      app_stages_text = '';
    }
    if (procedure_type == Application.models.Procedure.type_ids.quotation) {
      date_applic_opened_text = 'Дата рассмотрения заявок';
    }
  }
  if (!Main.config.advance_guarantee_configurable &&
        (procedure_type == Application.models.Procedure.type_ids.auction_up
          || procedure_type == Application.models.Procedure.type_ids.auction_down
          || procedure_type == Application.models.Procedure.type_ids.contest)) {
    guarantee_advance_text = '<tpl if="values.guarantee_advance_set">Требуется предоставление обеспечения возврата аванса в размере не менее суммы авансовых платежей'+
                             '<tpl if="guarantee_advance_type==1"> до заключения договора</tpl>'+
                             '<tpl if="guarantee_advance_type==2"> с момента заключения договора</tpl>\n</tpl>';
  }
  if ('percent' == Main.config.warranty_guarantee_type) {
    guarantee_warranty_text = '<tpl if="values.guarantee_warranty">Размер обеспечения гарантийных обязательств: {guarantee_warranty} %\n</tpl>';
  } else if ('text'==Main.config.warranty_guarantee_type) {
    guarantee_warranty_text = '<tpl if="values.guarantee_warranty_text">Размер обеспечения гарантийных обязательств: {guarantee_warranty_text}\n</tpl>';
  }

  var tpl = 'ИЗВЕЩЕНИЕ О ПРОВЕДЕНИИ ПРОЦЕДУРЫ {[this.procedureClass(this.procedure_type)]}\n\n'+
    'Форма торгов: {procedure_type_vocab}<tpl if="values.price_increase"> (на повышение)</tpl>'+
    '<tpl if="values.with_prequalification"> c проведением квалификационного отбора</tpl>'+
    '\n'+
    '<tpl if="values.purchase_method_name">Способ закупки по классификатору ЕИС: {purchase_method_name}\n</tpl>' +
    'Наименование процедуры: {title}\n\n'+    
    'ДАННЫЕ ОБ ОРГАНИЗАТОРЕ\n'+
    'Наименование организатора: {org_full_name}\n'+
    'Тип организатора: {org_customer_type}\n'+
    'Местонахождение организатора: {org_postal_address}\n'+
    'Контактный телефон: {contact_phone}\n'+
    '<tpl if="Main.config.procedure_contact_fax && values.contact_fax">Факс: {contact_fax}\n</tpl>'+
    'Адрес электронной почты: {contact_email}\n'+
    'Ф.И.О.контактного лица: {contact_person}\n'+
    '<tpl if="Main.config.review_applics_city && values.review_applics_city">'+
    'Место рассмотрения предложений: {review_applics_city}\n'+
    '</tpl>' +
    '\nСВОЙСТВА ПРОЦЕДУРЫ\n'+
    '<tpl if="values.private">Заказчик ограничил доступ к участию в процедуре ограниченным кругом заявителей\n</tpl>'+
    '{[this.renderStepInfo(values.steps)]}'+
    '<tpl if="values.application_stages!==undefined">'+
    app_stages_text+
    '</tpl>'+
    '<tpl if="Application.models.Procedure.groups.auctions.indexOf(procedure_type)&gt;=0">'+
      '<tpl if="values.offers_wait_time">'+
      'Время ожидания ценовых предложений: {offers_wait_time} минут\n'+
      '</tpl>'+
      '<tpl if="values.offers_step_min">'+
      'Шаг ценовых предложений'+
        '<tpl if="!values.step_is_exact">'+
          ': от {offers_step_min}% до {offers_step_max}%\n'+
        '</tpl>'+
        '<tpl if="values.step_is_exact">'+
          ' (в валюте договора): от {offers_step_min} до {offers_step_max}\n'+
        '</tpl>'+
      '</tpl>'+
    '</tpl>'+
    '<tpl if="values.date_published!==undefined">'+
    'Дата публикации: {[fm.localDateOnlyRenderer(values.date_published)]}\n'+
    '</tpl>' +
    '<tpl if="values.steps">{[this.renderStepDates(values.steps, values.procedure_type)]}</tpl>' /*+
    '<tpl if="values.date_end_registration!==undefined">'+
    'Дата окончания подачи заявок на участие: {[fm.localDateText(values.date_end_registration)]}\n'+
    '</tpl>'+
    '<tpl if="values.date_end_prequalification!==undefined">'+
    'Дата окончания предквалификационного отбора: {[fm.localDateOnlyRenderer(values.date_end_prequalification)]}\n'+
    '</tpl>'+
    '<tpl if="values.date_start_qualification!==undefined">'+
    'Дата начала процедуры квалификационного отбора: {[fm.localDateOnlyRenderer(values.date_start_qualification)]}\n'+
    '</tpl>'+
    '<tpl if="values.date_end_correction!==undefined">'+
    'Дата окончания подачи окончательных предложений: {[fm.localDateText(values.date_end_correction)]}\n'+
    '</tpl>'+
   '<tpl if="values.date_applic_opened!==undefined">'+
    date_applic_opened_text + ': {[fm.localDateText(values.date_applic_opened)]}\n'+
    '</tpl>'+
    '<tpl if="values.date_end_first_parts_review!==undefined">'+
    date_end_first_parts_review_text + ': {[fm.localDateOnlyRenderer(values.date_end_first_parts_review)]}\n'+
    '</tpl>'+
    '<tpl if="values.date_end_evaluation!==undefined">'+
   'Дата окончания оценочной стадии рассмотрения заявок на участие: {[fm.localDateOnlyRenderer(values.date_end_evaluation)]}\n'+
    '</tpl>'+
    '<tpl if="values.date_begin_auction!==undefined">'+
    'Дата торгов: {[fm.localDateText(values.date_begin_auction)]}\n'+
    '</tpl>'*/;
  tpl+=
    /*'<tpl if="values.date_end_second_parts_review!==undefined">'+
    date_end_second_parts_review_text + ': {[fm.localDateOnlyRenderer(values.date_end_second_parts_review)]}\n'+
    '</tpl>'+
    '<tpl if="values.date_end_postqualification!==undefined">'+
    'Дата окончания постквалификации: {[fm.localDateOnlyRenderer(values.date_end_postqualification)]}\n'+
    '</tpl>'+*/
    //2013/07/18 ptanya 3610 rel #41812 право заказчика отказаться от аукциона
    //'<tpl if="values.date_may_canceled">'+
    //  'Заказчик оставляет за собой право на отказ от процедуры до {[fm.localDateOnlyRenderer(values.date_may_canceled)]}\n'+
    //'</tpl>' +
    //2013/08/15 ptanya 3610 rel #41812 в "Отказ от проведения процедуры" можно написать все что хочется
    '<tpl if="values.canceled_text">'+
      '{values.canceled_text}\n'+
    '</tpl>' +
    '<tpl if="Main.config.subject_code && values.procedure_subject_codes">'+
      '\nКОД ПРЕДМЕТА ЗАКУПКИ \n'+
      '<tpl for="values.procedure_subject_codes">'+
        '{full_name}\n'+
      '</tpl>'+
    '</tpl>'+
    '<tpl if="Main.config.inner_classification && values.procedure_inner_classification">'+
      '\nКОД ВНУТРЕННЕЙ КЛАССИФИКАЦИИ ЗАКУПКИ \n'+
      '<tpl for="values.procedure_inner_classification">'+
        '{full_name}\n'+
      '</tpl>'+
    '</tpl>'+
    '<tpl if="common_files.length!=0">'+
    '\nДОКУМЕНТАЦИЯ ПРОЦЕДУРЫ \n'+
     '<tpl for="common_files">'+
      '{#}. {descr} - {name}  (контрольная сумма ГОСТ Р34.11-94: {hash}) \n'+
    '</tpl>'+
    '</tpl>'+
    '<tpl for="lots">'+
      '\nЛОТ № {number}\n'+
      'Заказчики, с которыми заключается договор:\n'+
      '<tpl for="lot_customers">\n'+
        '{#}. {full_name}. Адрес местонахождения: {address}\n\n'+
      '</tpl>'+
      'ПРЕДМЕТ ДОГОВОРА\n'+
      '{subject}\n'+
      'Начальная цена: <tpl if="values.start_price">{[fm.price(values.start_price)]}</tpl><tpl if="!values.start_price">не указано</tpl>\n'+
      'Валюта: {currency_vocab}\n'+
      '<tpl if="values.single_unit">'+
        'Торги за единицу. <tpl if="values.unit_price">Начальная цена комплекта: {[fm.price(values.unit_price)]}</tpl>\n' +
      '</tpl>' +
      '<tpl if="values.date_end_contract">'+
        'Срок заключения договора: {[fm.localDateOnlyRenderer(values.date_end_contract)]}\n'+
      '</tpl>' +
      '<tpl for="nomenclature">\n'+
        '{full_name}\n'+
      '</tpl>'+
      '<tpl for="okved">\n'+
        '{full_name}\n'+
      '</tpl>'+
      '<tpl for="okved2">\n'+
        '{full_name}\n'+
      '</tpl>'+
      '<tpl if="values.lot_units.length!=0">'+
        '\nПЕРЕЧЕНЬ ПОСТАВЛЯЕМЫХ ТОВАРОВ, ВЫПОЛНЯЕМЫХ РАБОТ, ОКАЗЫВАЕМЫХ УСЛУГ\n'+
        '<tpl for="lot_units">'+
          'ПОЗИЦИЯ {#}\n'+
          'Наименование: {name}\n'+
          'Количество: {quantity}\n'+
          'ОКЕИ: {okei_symbol}\n'+
          'ОКВЭД: {okved_code}\n'+
          '<tpl if="Main.config.show_okpd2_and_okved2">ОКВЭД2: {okved2_code}\n</tpl>'+
          '<tpl if="values.requirements.length!=0">'+
            'ХАРАКТЕРИСТИКИ\n'+
            '<tpl for="requirements">'+
              '{#}. {requirement} ({type_vocab}): {value}\n'+
            '</tpl>'+
          '</tpl>'+
          '<tpl if="values.simple_requirements">'+
            'ХАРАКТЕРИСТИКИ\n'+
            '{simple_requirements}\n'+
          '</tpl>'+
        '</tpl>'+
      '</tpl>\n'+
       '<tpl if="values.lot_delivery_places.length!=0">';
  tpl +=
      '\nМЕСТО И УСЛОВИЯ ПОСТАВКИ\n'+
      '<tpl for="lot_delivery_places">'+
        '<tpl if="quantity">Объем поставки: {[this.processNotRequired(values.quantity)]}\n</tpl>'+
        '<tpl if="address">Адрес поставки: {[this.processNotRequired(values.address)]}\n</tpl>'+
        '<tpl if="term">Условия поставки: {[this.processNotRequired(values.term)]}\n</tpl>'+
        '\n'+
      '</tpl>'+
      '</tpl>'+
      'ТРЕБОВАНИЯ К ЗАЯВИТЕЛЯМ\n'+
      '<tpl if="values.guarantee_application">Размер обеспечения заявки на участие: {[fm.price(values.guarantee_application)]}\n</tpl>'+
      '<tpl if="values.guarantee_application">Валюта обеспечения заявки на участие: {guarantee_currency_vocab}\n</tpl>'+
      guarantee_contract_text +
      guarantee_advance_text +
      guarantee_warranty_text +
      '<tpl if="values.insurance_types && values.insurance_types != 1">' +
        '\nУсловиями закупки предусмотрено страхование:\n' +
        '<tpl if="values.insurance_types%2==0">  Страхование строительно-монтажных рисков\n</tpl>'+
        '<tpl if="values.insurance_types%3==0">  Страхование грузов на время транспортировки\n</tpl>'+
        '<tpl if="values.insurance_types%5==0">  Страхование персонала от несчастного случая\n</tpl>'+
        '<tpl if="values.insurance_types%7==0">  Страхование ответственности перед третьими лицами (страхование профессиональной ответственности, страхование общегражданской ответственности и т.д)\n</tpl>'+
        '<tpl if="values.insurance_types%11==0">  Иные виды страхования (страхование имущества, личное страхование, комплексные программы страхования)\n</tpl>'+
        '\n'+
      '</tpl>'+
      '<tpl for="lot_doc_requirements">'+
        '{#}. {requirement} (основание: {reason}), {application_part}-я часть заявки\n'+
      '</tpl>'+
      '<tpl if="values.simple_preferences">'+
        'УСТАНОВЛЕНЫ ПРЕФЕРЕНЦИИ ОТДЕЛЬНЫМ УЧАСТНИКАМ\n'+
        '{simple_preferences}\n\n'+
      '</tpl>'+
      '<tpl if="values.simple_evaluation_criteries">'+
        'КРИТЕРИИ ОЦЕНКИ ЗАЯВОК\n'+
        '{simple_evaluation_criteries}\n\n'+
      '</tpl>'+
      '<tpl if="values.simple_requirements">'+
        'ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ ДЛЯ ЗАЯВИТЕЛЕЙ\n'+
        '{simple_requirements}\n\n'+
      '</tpl>'+
      '<tpl if="values.lot_documentation.length!=0">'+
      'ДОКУМЕНТАЦИЯ ПО ЛОТУ \n'+
       '<tpl for="lot_documentation">'+
        '{#}. {descr} - {name}  (контрольная сумма ГОСТ Р34.11-94: {hash}) '+
      '</tpl>'+
      '</tpl>'+
    '</tpl>';
  var procedureSignatureTemplate = new Ext.XTemplate(tpl, {
    processNotRequired: function (v){
      if(Ext.isEmpty(v) || v=='null') return 'не указано'; else return v;
    },
    procedureClass: function(t) {
      if ([Application.models.Procedure.type_ids.peretorg_reduc, Application.models.Procedure.type_ids.peretorg_contest].indexOf(t)>=0) {
        return 'ПЕРЕТОРЖКИ';
      }
      return 'ЗАКУПКИ';
    },
    renderStepDates: function(steps, procedure_type) {
      if (!steps) {
        return '';
      }
      var s = '';
      steps = Ext.util.JSON.decode(steps);
      for (i = 0; i < steps.length; i++) {
        st = steps[i];
        step_data = Application.models.Procedure.getStep(st.step_id);
        full_name = step_data.full_name.defaultName;
        if(step_data.full_name[procedure_type]) {
          full_name = step_data.full_name[procedure_type];
        }
        dt = st['date_end'];
        if (Ext.isEmpty(dt)) {
          dt = st['date_start'];
        }
        if (full_name && dt) { //2013/12/03 ptanya 3719 даты у этапа может не быть
          if (step_data['displayFormat'] && step_data['displayFormat'] == 'd.m.Y') {
            dt = Ext.util.Format.localDateOnlyRenderer(dt);
          } else {
            dt = Ext.util.Format.localDateText(dt);
          }
          s += full_name + ': ' + dt + '\n';
        }
      }
      return s;
    },
    renderStepInfo : function(step_info) {
      if(!Main.config.multistep_support) {
        return '';
      }
      var steps = '', stepString='';
      if(!Ext.isEmpty(step_info)) {
        step_info = Ext.util.JSON.decode(step_info);
      } else {
        return steps;
      }
      steps += '\nЭТАПЫ ПРОВЕДЕНИЯ ПРОЦЕДУРЫ\n';
      for(var i=0; i<step_info.length; i++) {
        stepString = Main.config.procedure_steps[step_info[i]['step_id']].full_name+'\n';
        steps+=stepString;
      }
      return steps+'\n';
    },
    procedure_type: procedure_type
  });
  return procedureSignatureTemplate;
}
/*
function getApplicText() {
 var tpl=null;
 var params = {};
 params.contragent_type = (Main.contragent.supplier_profile_id!=SUPPLIER_TYPE_FIZ_RF && Main.contragent.supplier_profile_id!=SUPPLIER_TYPE_FIZ_FOREIGN) ? 'fizik':'urik';
 performRPCCall(RPC.Reference.getApplicationText, [params], null, function(resp) {
   tpl = resp.application_text;
   return tpl
 });

 //if(Main.contragent.supplier_profile_id)
 /*tpl = 'Изучив извещение o проведении электронного аукциона, включая опубликованные изменения и аукционную документацию, настоящим удостоверяется, что мы (я), нижеподписавшиеся (-ийся), согласны (ен) поставить (выполнить, оказать) указанный в аукционной документации предмет договора в соответствии c указанной аукционной документацией стоимостью (по цене) не выше начальной (максимальной) цены договора.';

 if(Main.contragent.supplier_profile_id!=SUPPLIER_TYPE_FIZ_RF && Main.contragent.supplier_profile_id!=SUPPLIER_TYPE_FIZ_FOREIGN) {

 tpl += 'Настоящей заявкой подтверждаем (-ю), что: -против нас (меня) не проводится процедура ликвидации;\n'+

 '- в отношении нас (меня) отсутствует решение арбитражного суда о признании банкротом и об открытии конкурсного производства;\n'+

 '- наша (моя) деятельность не приостановлена;\n'+

 '- а также, что размер задолженности по начисленным налогам, сборам и иным обязательным платежам в бюджеты любого уровня или государственные внебюджетные фонды за прошедший календарный год не превышает 25°/о балансовой стоимости наших активов по данным бухгалтерской отчетности за последний завершенный отчетный период.\n';
}

tpl += 'Мы (я) подтверждаем (-ю) отсутствие нашей (моей) аффилированности с Заказчиком (а также с его cотрудниками, должностными лицами.\n'+

'Мы (я) гарантируем (-ю) достоверность информации, содержащейся в документах и сведениях, находящихся в реестре аккредитованных на электронной торговой площадке участников размещения заказа.\n'+

'Мы (я) уведомлены (-н) o том, что информация из реестра аккредитованных на электронной торговой площадке участников размещения заказа на дату и время окончания срока подачи заявок будет направлена на рассмотрение в составе второй части заявки на участие в электронном аукционе.\n'+

'Мы (я) поручаем (-ю) Оператору электронной торговом площадки блокировать операции по счету, открытому для проведения операций по обеспечению участия в электронных аукционах, в отношении денежных средств в размере обеспечения заявки на участие в электронном аукционе.\n'+

'Мы (я) обязуемся (-юсь) , в случае если мы (я) окажемся (-усь) победителем аукциона при условии получения от Заказчика проекта договора, составленного путем включения цены договора, предложенной нами (мной) на аукционе, в проект договора, прилагаемый к аукционном документации, предоставить Заказчику подписанный договор в срок не позднее, чем пять дней c момента получения от Заказчика проекта договора.\n'+

'Мы (я) обязуемся (-юсь), в случае если мы (я) окажемся (-усь) участником, cделавшим предпоследнее предложение o цене договора и если победитель аукциона будет признан уклонившимcя от заключения договора, при условии получения от Заказчика проекта договора, составленного путем включения цены договора, предложенной нами (мной) на аукционе, в проект договора, прилагаемый к аукционной документации, а также при отсутствии факта отзыва нашей (моей) заявки на участие в аукционе в случаях, предусмотренных 94-ФЗ, предоставить Заказчику подписанный договор в срок не позднее, чем пять дней с момента получения от Заказчика проекта договора.\n'+

'Мы (я) обязуемся (-юсь), в случае если мы (я) окажемся (-усь) участником, сделавшим следующее за предпоследним предложение o цене договора и если участник аукциона, сделавший предпоследнее предложение, будет признан уклонившимся от заключения договора, при условии получения от Заказчика проекта договора, составленного путем включения цены договора, предложенной нами (мной) на аукционе, в проект договора, прилагаемый к аукционной документации, предоставить Заказчику подписанный договор в срок не позднее, чем пять дней с момента получения от Заказчика проекта договора.\n'+

'Мы (я) обязуемся (-юсь), в случае если по результатам рассмотрения заявок наша (моя) заявка будет признана единственной соответствующей требованиям аукционной документации, при условии получения от Заказчика проекта договора, составленного путем включения цены договора, предложенной нами (мной) на аукционе, в проект договора, прилагаемый к аукционной документации, предоставить Заказчику подписанный договор в срок не позднее, чем пять дней c момента получения от Заказчика проекта договора.\n'+

'Мы (я) обязуемся (-юсь) в случае заключения c нами договора предоставить обеспечение договора в размере, предусмотренном аукционной документацией.\n'+

'Мы (я) обязуемся (-юсь), в случае заключения c нами договора, поставить (выполнить, оказать) указанный выше предмет договора в соответствии c требованиями аукционной документации.\n'+

'Мы (я) уведомлены (-н) o том, что в случае уклонения нами (мною) от заключения договора, денежные средства в размере обеспечения заявки на участие в электронном аукционе c нашего (моего) счета, открытого для проведения операций по обеспечению участия в электронных аукционах, будут переведены на счет заказчика.\n'+

'Мы (я) извещены (-н) o том, что в случае победы в аукционе при нашем (моем) уклонении от заключения договора или при расторжении c нами (co мной) договора по решению суда в связи c существенны м нарушением нами (мной) условий договора, сведения o нас (обо мне) будут включены в реестр недобросовестных поставщиков.';
return tpl;
}
*/
function cmpdataTpl() {
  var cmpdata = '\n\nДАННЫЕ О ЗАЯВИТЕЛЕ\n'+
          'Наименование/Ф.И.О. заявителя: {full_name}\n'+
          'ИНН: {inn}\n'+
          'Юридический адрес: {legal_address}\n'+
          'Почтовый адрес: {postal_address}\n'+
          '<tpl if="values.phone">Контактный телефон: {phone}\n</tpl>'+
          '<tpl if="values.max_sum_docs && values.max_sum_docs.length!=0">'+
                'Документ об одобрении суммы сделки\n'+
          '<tpl for="max_sum_docs">\n'+
            '{#}. {descr} - {name} (контрольная сумма ГОСТ Р34.11-94: {hash})\n'+
          '</tpl></tpl>';
  return cmpdata;
}

function cmpdataTblTpl() {
  var cmpdata = '<tr><th colspan="2">ДАННЫЕ О ЗАЯВИТЕЛЕ</th></td></tr>'+
          '<tr><th>Наименование/Ф.И.О. заявителя:</th><td>{full_name}</td></tr>'+
          '<tr><th>ИНН:</th><td>{inn}</td></tr>'+
          '<tr><th>Юридический адрес:</th><td>{legal_address}</td></tr>'+
          '<tr><th>Почтовый адрес:</th><td>{postal_address}</td></tr>'+
          '<tr><th>Контактный телефон:</th><td>{phone}</td></tr>'+
          '<tpl if="values.max_sum_docs && values.max_sum_docs.length!=0">'+
                '<tr><th>Документ об одобрении суммы сделки</th><td>'+
          '<tpl for="max_sum_docs">'+
            '{#}. {descr} - {name} (контрольная сумма ГОСТ Р34.11-94: {hash})<br>'+
          '</tpl></td></tr></tpl>';
  return cmpdata;
}

function getApplicSignatureTemplate(totalParts, procedure_type) {
  var tpl = 'ЗАЯВКА НА УЧАСТИЕ В ПРОЦЕДУРЕ\n\n'+
    'Форма торгов: {procedure_type_vocab}'+
    '<tpl if="values.procedure.with_prequalification"> c проведением квалификационного отбора</tpl>'+
    '\n'+
    'Краткое наименование процедуры: {title}\n'+
    'Реестровый номер процедуры: {registry_number}\n'+
    'Лот\n' +
    '<tpl if="price">Цена предложения в валюте начальной цены лота {price}<tpl if="price_with_vat"> (цена с НДС)</tpl>\n</tpl>'+
    '\n{applic_text}\n'+
    '<tpl for="parts">'+
      '<tpl if="partNumber==1">';
      if(totalParts==2) {
        tpl +='\n\nПЕРВАЯ ЧАСТЬ ЗАЯВКИ\n';
      }
      tpl += '<tpl if="values.application_units!=undefined">'+
          '<tpl for="application_units">\n'+
            '{#}. {name}, торговая марка {trademark}\n'+
            '<tpl if="values.simple_parameters>\n'+
              'Характеристики:\n'+
              '{simple_parameters}\n'+
            '</tpl>'+
            '<tpl if="values.application_unit_params!=undefined">\n'+
              '<tpl for="application_unit_params">'+
                '{#}. {requirement}: {value}\n'+
              '</tpl>'+
            '</tpl>'+
          '</tpl>'+
        '</tpl>';

         if(totalParts==1) {
          tpl += cmpdataTpl();
         }
         if(totalParts!=3 && procedure_type!=Application.models.Procedure.type_ids.public_sale) {
            tpl +='<tpl if="values.application_docs || values.application_docs_other">'+
            '\n\nДОКУМЕНТЫ, ПРИЛОЖЕННЫЕ К ПЕРВОЙ ЧАСТИ ЗАЯВКИ\n\n'+
             '<tpl if="values.application_docs">'+
               '<tpl for="application_docs">\n'+
                 '{#}. {description} - {name} (контрольная сумма ГОСТ Р34.11-94: {hash})\n'+
               '</tpl>'+
             '</tpl>'+
             '<tpl if="values.application_docs_other">'+
               '<tpl for="application_docs_other">\n'+
                 '{#}. {descr} - {name} (контрольная сумма ГОСТ Р34.11-94: {hash})\n'+
               '</tpl>'+
             '</tpl>'+
            '</tpl>';
         }
 tpl+='</tpl>';

        tpl+='<tpl elseif="partNumber==2">';
          tpl+='\nВТОРАЯ ЧАСТЬ ЗАЯВКИ\n'+cmpdataTpl();
          tpl +='<tpl if="values.application_docs || values.application_docs_other">'+
                '\n\nДОКУМЕНТЫ, ПРИЛОЖЕННЫЕ КО ВТОРОЙ ЧАСТИ ЗАЯВКИ\n\n'+
                '<tpl if="values.application_docs">'+
                  '<tpl for="application_docs">\n'+
                  '{#}. {description} - {name} (контрольная сумма ГОСТ Р34.11-94: {hash})\n'+
                  '</tpl>'+
                '</tpl>'+
                '<tpl if="values.application_docs_other">'+
                  '<tpl for="application_docs_other">\n'+
                    '{#}. {descr} - {name} (контрольная сумма ГОСТ Р34.11-94: {hash})\n'+
                  '</tpl>'+
                '</tpl>'+
                '</tpl>';
        tpl+='</tpl>';
     tpl+='</tpl>';

  var applicSignatureTemplate = new Ext.XTemplate(tpl);
  return applicSignatureTemplate;
}

function getApplicDataTemplate(totalParts) {
  var tpl = '<table class="tpltbl">'+
    '<tr><th>Форма торгов:</th><td> {procedure_type_vocab}'+
    '<tpl if="values.procedure.with_prequalification"> c проведением квалификационного отбора</tpl>'+
    '</td></tr>'+
    '<tr><th>Краткое наименование процедуры:</th><td> {title}</td></tr>'+
    '<tr><th>Реестровый номер процедуры:</th><td> {registry_number}</td></tr>'+
    '<tr><th>Лот</th><td>&nbsp;</td></tr>' +
    '<tr><th>Цена предложения в валюте начальной цены лота:</th><td>{price}'+
    '<tr><td colspan="2">{applic_text}</td></tr>'+
    '<tpl for="parts">'+
      '<tpl if="partNumber==1">'+
        '<tr><th colspan="2">ПЕРВАЯ ЧАСТЬ ЗАЯВКИ</th></tr>'+
        '<tpl if="values.application_units!=undefined">'+
        '<tr><td colspan="2">Перечень поставляемых товаров, выполняемых работ, оказываемых услуг</td></tr><tr><td colspan="2"><table class="tplsubtbl"><tr><td>Наименование товара/услуги</td><td>Торговая марка</td><td>Цена</td><td>Характеристики</td></tr>'+
          '<tpl for="application_units">\n'+
            '<tr><td>{name}</td><td>{trademark}</td><td>{price}</td><td>'+
            '<tpl if="values.application_unit_params!=undefined">'+
              '<tpl for="application_unit_params">'+
                '{#}. {requirement}: {value}<br>'+
              '</tpl>'+
            '</tpl></td></tr>'+
          '</tpl></table></td></tr>'+
        '</tpl>';

         if(totalParts==1) {
          tpl += cmpdataTblTpl();
         }
         tpl +='<tpl if="values.application_docs!=undefined">'+
         '<tr><th colspan="2">ДОКУМЕНТЫ, ПРИЛОЖЕННЫЕ К ПЕРВОЙ ЧАСТИ ЗАЯВКИ</th></tr>'+
          '<tr><td colspan="2"><tpl for="application_docs">'+
            '{#}. {descr} - <a href="{link}">{name}</a> (контрольная сумма ГОСТ Р34.11-94: {hash})<br>'+
          '</tpl>'+
          '<tr><th colspan="2">ПРОЧИЕ ДОКУМЕНТЫ</th></tr><tr><td colspan="2"><tpl for="applic_docs_other">'+
            '{#}. {descr} - <a href="{link}">{name}</a> (контрольная сумма ГОСТ Р34.11-94: {hash})<br>'+
          '</tpl></td></tr>'+
        '</tpl>';
 tpl+='</tpl>';

        tpl+='<tpl elseif="partNumber==2">';
          tpl+='<tr><th colspan="2">ВТОРАЯ ЧАСТЬ ЗАЯВКИ</th></tr>'+cmpdataTblTpl();
          tpl +='<tpl if="values.application_docs!=undefined">'+
                '<tr><th colspan="2">ДОКУМЕНТЫ, ПРИЛОЖЕННЫЕ КО ВТОРОЙ ЧАСТИ ЗАЯВКИ</th></tr>'+
                '<tr><td colspan="2"><tpl for="application_docs">\n'+
                '{#}. {descr} - <a href="{link}">{name}</a> (контрольная сумма ГОСТ Р34.11-94: {hash})<br>'+
                '</tpl></td></tr>'+
                '</tpl>'+
                '<tr><th colspan="2">ПРОЧИЕ ДОКУМЕНТЫ</th></tr><tr><td colspan="2"><tpl for="applic_docs_other">'+
                  '{#}. {descr} - <a href="{link}">{name}</a> (контрольная сумма ГОСТ Р34.11-94: {hash})<br>'+
                '</tpl></td></tr>';

        tpl+='</tpl>';
     tpl+='</tpl></table>';

  var applicDataTemplate = new Ext.XTemplate(tpl);
  return applicDataTemplate;
}

function getBalanceTemplate() {
  var account = '';
  if (isAdmin()) {
    account = '<tr><th>Номер лицевого счета:</th><td> {values.account}</td></tr>';
  }
  return new Ext.XTemplate('<table class="tpltbl">'+
    '<tr><th>Текущий баланс счета:</th><td> {[fm.price(values.deposit)]} руб.</td></tr>'+
    '<tr><th>Из них заблокировано на обеспечение участия в процедурах:</th><td> {[fm.price(values.deposit_blocked)]} руб.</td></tr>'+
    '<tr><th>Из них заблокировано на возврат:</th><td> {[fm.price(values.toreturn)]} руб.</td></tr>'+
    '<tr><th>Из них доступно:</th><td> {[fm.price(values.available_sum)]} руб.</td></tr>'+account+'</table>');
}

function getBankdataTemplate() {
  return new Ext.XTemplate('<table class="tpltbl">'+
    '<tr><th>Расчетный счет:</th><td> {account}</td></tr>'+
    '<tr><th>Корреспондентский счет:</th><td> {kor_account}</td></tr>'+
    '<tr><th>БИК:</th><td> {bik}</td></tr>'+
    '<tr><th>ИНН:</th><td> {inn}</td></tr>'+
    '<tr><th>КПП:</th><td> {kpp}</td></tr>'+
    '<tr><th>Наименование банка:</th><td> {bank}</td></tr>'+
    '<tr><th>Наименование получателя:</th><td> {receiver}</td></tr>'+
    '<tr><th>Назначение платежа:</th><td> {paydest}</td></tr></table>');
}

function getBankshortdataTemplate() {
  return new Ext.XTemplate('<table class="tpltbl">'+
    '<tr><th>Расчетный счет:</th><td> {account}</td></tr>'+
    '<tr><th>Корреспондентский счет:</th><td> {kor_account}</td></tr>'+
    '<tr><th>БИК:</th><td> {bik}</td></tr>'+
    '<tr><th>Наименование банка:</th><td> {bank}</td></tr>'+
    '<tr><th>Адрес банка:</th><td> {bank_addr}</td></tr>'+
    '</table>');
}

function getApplyToReturnText() {
  var tpl = 'Прошу осуществить возврат средств в размере {sum} руб. на банковский счет, указанный в аккредитационных сведениях'+
    ' обладателя лицевого счета {account} {full_name} (ИНН {inn}).\n';
  return new Ext.XTemplate(tpl);
}

function getUserdataTemplate() {
  return new Ext.XTemplate('<table class="tpltbl">'+
    '<tr><th>Фамилия, имя и отчество:</th><td> {last_name} {first_name} {middle_name}</td></tr>'+
    '<tr><th>Адрес электронной почты:</th><td> {user_email}</td></tr>'+
    '<tr><th>Внешняя электронная почта:</th><td> {user_external_email}</td></tr>'+
    '<tr><th>Логин:</th><td> {username}</td></tr>'+
    '<tr><th>Должность:</th><td> {user_job}</td></tr>'+
    '<tr><th>Телефон:</th><td> {string_user_phone}</td></tr>' +
    '<tr><th>Роли в системе:</th><td> {role_list}</td></tr>'+
    '<tr><th>Текущий статус:</th><td> {statusname}</td></tr>'+
    '<tr><th>Дата окончания регистрации:</th><td> {date_valid_for}</td></tr></table>');
}

function getCompanydataTemplate() {
  return new Ext.XTemplate('<table class="tpltbl">'+
    '<tr><th>Полное наименование / Ф.И.О.:</th><td> <tpl if="values.full_name!=undefined">{full_name}</tpl><tpl if="values.full_name==undefined">Отсутствуют подписанные данные</tpl></td></tr>'+
    '<tr><th>ИНН:</th><td> {inn}</td></tr>'+
    '<tr><th>КПП:</th><td> <tpl if="values.kpp!=undefined">{kpp}</tpl><tpl if="values.kpp==undefined">Отсутствуют подписанные данные</tpl></td></tr>'+
    '<tr><th>ОГРН:</th><td> <tpl if="values.ogrn!=undefined">{ogrn}</tpl><tpl if="values.ogrn==undefined">Отсутствуют подписанные данные</tpl></td></tr>'+
    '<tpl if="values.phone">'+
    '<tr><th>Телефон:</th><td> {phone}</td></tr>'+
    '</tpl>'+
    '<tpl if="values.fax!=undefined">'+
    '<tr><th>Факс:</th><td> {fax}</td></tr>'+
    '</tpl>'+
    '<tpl if="values.email">'+
    '<tr><th>E-mail:</th><td> {email}</td></tr>'+
    '</tpl>'+
    '<tpl if="values.website && values.website!=\'null\'">'+
    '<tr><th>Web сайт:</th><td> {website}</td></tr>'+
    '</tpl>'+
    '<tpl if="values.contact_fio && values.contact_fio!=\'null\'">'+
    '<tr><th>Контактное лицо:</th><td> {contact_fio}</td></tr>'+
    '</tpl>'+
    '<tr><th>Юридический адрес:</th><td> <tpl if="values.legal_address!=\'\'">{legal_address}</tpl><tpl if="values.legal_address==\'\'">Отсутствуют подписанные данные</tpl></td></tr>'+
    '<tr><th>Почтовый адрес:</th><td> <tpl if="values.postal_address!=\'\'">{postal_address}</tpl><tpl if="values.postal_address==\'\'">Отсутствуют подписанные данные</tpl></td></tr>'+
    '</table>');
}

function getShortCompanydataTemplate() {
  return new Ext.XTemplate('<table class="tpltbl">'+
    '<tr><th>Полное наименование организации:</th><td> {full_name}</td></tr>'+
    '<tr><th>ИНН:</th><td> {inn}</td></tr>'+
    '<tr><th>КПП:</th><td> {kpp}</td></tr>'+
    '<tr><th>ОГРН:</th><td> {ogrn}</td></tr></table>');
}

function getProceduresStatisticsTemplate() {
  return new Ext.XTemplate('<table class="stattbl">'+
    '<tr><th>Количество объявленных процедур:</th><td>{procedures_active}</td></tr>'+
    '<tr><th>Количество проведенных процедур:</th><td>{procedures_succeded}</td></tr>'+
    '<tr><th>Общая стоимость заключаемых договоров (руб):</td><td>{total_procedures_price}</td></tr>'+
    '<tr><th>% достигнутой экономии:</th><td>{budget_economy}</td></tr>'+
    '<tr><th>Количество несостоявшихся процедур:</td><td>{procedures_failed}</td></tr></table>'
  );
}

function getProceduresCommonStatisticsTemplate() {
  return new Ext.XTemplate('<table class="stattbl">'+
    '<tr><th>Количество заказчиков, получивших регистрацию:</th><td>{total_customes}</td></tr>'+
    '<tr><th>Количество аккредитованных участников (поставщиков):</th><td>{total_suppliers}</td></tr>'+
    '<tr><th>Общая сумма средств на счетах участников (руб):</td><td>{suppliers_deposit}</td></tr>'+
    '<tr><th>Сумма заблокированных средств на счетах участников (руб):</th><td>{suppliers_deposit_blocked}</td></tr></table>'
  );
}

function getTradeOfferTemplate() {
  return new Ext.XTemplate(
    'Подача ценового предложения\n'+
      'Процедура: {procedure}, лот {lot}\n'+
      'Предложение: {price}\n'+
      'Время: {time}'
  );
}

function getProcedureCancelTemplate() {
  return new Ext.XTemplate("ОТКАЗ ОТ ПРОВЕДЕНИЯ ПРОЦЕДУРЫ\n"+
  "Настоящим подтверждаю отказ от проведения процедуры № " +
  "<tpl if='registry_number'>{registry_number}</tpl>" +
  "<tpl if='!registry_number'>{id}</tpl>.\n" +
  'Основание для отказа: <tpl if="cancel_basis">{cancel_basis}</tpl><tpl if="!cancel_basis">не указано</tpl>.\n'+
  "{date_cancelled}\n"+
  "{user_fio}\n");
}

function getLotCancelTemplate() {
  return new Ext.XTemplate("ОТКАЗ ОТ ПРОВЕДЕНИЯ ЛОТА\n"+
  "Настоящим подтверждаю отказ от проведения лота № {lot_number} процедуры № " +
  "<tpl if='registry_number'>{registry_number}</tpl>" +
  "<tpl if='!registry_number'>{id}</tpl>.\n" +
  'Основание для отказа: <tpl if="cancel_basis">{cancel_basis}</tpl><tpl if="!cancel_basis">не указано</tpl>.\n'+
  "{date_cancelled}\n"+
  "{user_fio}\n");
}

function getProcedureDocumentAddTemplate() {
  return new Ext.XTemplate("Настоящим подтверждаю загрузку прочих документов в состав протоколов лота № " +
    "{lot_number} процедуры № " +
    "<tpl if='registry_number'>{registry_number}</tpl>" +
    "<tpl if='!registry_number'>{id}</tpl>.\n" +
  "{user_fio}\n" +
  "Документы:\n");
}

function getProcedureOperatorDocumentAddTemplate() {
  return new Ext.XTemplate("Настоящим подтверждаю загрузку документов в извещение лота № {lot_number} процедуры № " +
    "<tpl if='registry_number'>{registry_number}</tpl>" +
    "<tpl if='!registry_number'>{id}</tpl>.\n" +
  "{user_fio}\n" +
  "Документы:\n" +
  "{files_text}");
}

function getProcedureDataForIntentionTemplate() {
  var procedureDataTemplate = new Ext.XTemplate(
    '<table class="tpltbl">'+
    '<tr><th>Номер закупки:</th><td>' +
    "<tpl if='registry_number'>{registry_number}</tpl>" +
    "<tpl if='!registry_number'>{id}</tpl>" +
    ', лот №{values.lot.number}</td></tr>' +
    '<tr><th>Наименование закупки:</th><td>{title}</td></tr>'+
    '<tr><th>Способ закупки:</th><td>{procedure_type_vocab}</td></tr>'+
    '<tr><th>Организатор:</th><td>{org_full_name}</td></tr>'+
    '<tpl if="values.date_end_registration"><tr><th>Дата и время окончания подачи заявок:</th><td>{[fm.localDateText(values.date_end_registration)]}</td></tr></tpl>'+
    '</table>');

  return procedureDataTemplate;
}

function getSignIntentionTemplate() {
  var procedureDataTemplate = new Ext.XTemplate(
    "Номер закупки: " +
    "<tpl if='registry_number'>{registry_number}</tpl>" +
    "<tpl if='!registry_number'>{id}</tpl>" +
    ", лот №{values.lot.number}\n" +
    "Наименование закупки: {title}\n"+
    "Способ закупки: {procedure_type_vocab}\n"+
    "Организатор: {org_full_name}\n"+
    "Дата и время окончания подачи заявок: {[fm.localDateText(values.date_end_registration)]}\n");

  return procedureDataTemplate;
}

function getIntentionViewTemplate() {
  var procedureDataTemplate = new Ext.XTemplate(
    '<table class="tpltbl">'+
    '<tr><th>Номер закупки:</th><td>' +
    "<tpl if='registry_number'>{registry_number}</tpl>" +
    "<tpl if='!registry_number'>{id}</tpl>" +
    ', лот №{values.lot.number}</td></tr>' +
    '<tr><th>Наименование закупки:</th><td>{title}</td></tr>'+
    '</table>');

  return procedureDataTemplate;
}
