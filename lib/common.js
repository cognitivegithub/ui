/*
 * Constants
 */

var REQUIRED_FIELD='&nbsp;<span style="color: red; white-space:nowrap; font-weight:bold;" ext:qtip="Поле обязательно для заполнения">*</span>';
var IMAGE_LOADING = '/css/images/default/grid/loading.gif';
var WAITING = '<img src="'+IMAGE_LOADING+'" />';
var POST_VAR_PROCEDURE_ID = 'procedure_id';
var POST_VAR_LOT_ID = 'lot_id';
//var ACCEPTED_FILES = 'Принимаются файлы размером до {upload_file_size}&nbsp;Мбайт в следующих форматах: {upload_file_types}';
var ACCEPTED_FILES = 'Принимаются файлы в следующих форматах: {upload_file_types}';
var PIC_ACCEPTED_FORMATS = '.jpg, .gif, .png, .jpeg';
var MAX_UPLOAD_SIZE=1024*1024*10;
var PIC_UPLOAD_SIZE=1024*1024*3;

var LOADING_TEXT        = 'Загрузка данных...';
var DICT_VAL_NOR_FOUND  = 'Значение "%s" не зайдено в словаре...';

var DEFAULT_LABEL_WIDTH = 300; // Стандартная ширина label.

var USER_PROFILE_WITH_EDS = 1;
var USER_PROFILE_WITHOUT_EDS = 2;

var USER_STATUS_NOT_CONFIRMED = 1;
var USER_STATUS_NOT_AUTHORIZED = 2;
var USER_STATUS_AUTHORIZED = 3;
var USER_STATUS_BLOCKED = 4;
var USER_STATUS_DECLINED = 5;
var USER_STATUS_DELETED = 6;
var STATUS_ADDED = 1;
var STATUS_ACCEPTED = 3;

var TYPE_USER = 1;
var TYPE_OPERATOR = 2;
var TYPE_EXPERT = 3;

var SUPPLIER_TYPE_UR_RF = 1;
var SUPPLIER_TYPE_UR_FOREIGN = 4;
var SUPPLIER_TYPE_IP_RF = 3;
var SUPPLIER_TYPE_IP_FOREIGN = 5;
var SUPPLIER_TYPE_FIZ_RF = 2;
var SUPPLIER_TYPE_FIZ_FOREIGN = 6;

var CUSTOMER_TYPE_CUST = 1
var CUSTOMER_TYPE_ORG = 2;

var APPLIC_DOC_REQUIRED = 1;
var APPLIC_DOC_OTHER = 2;
var APPLIC_DOC_MAXSUM = 3;

// Этапы рассмотрения
var STAGE_REVIEW = 1; // рассмотрение первых частей, вскрытие конвертов (все поданные неотмененные)
var STAGE_RESULT = 2; // торги или подведение итогов (все неотмененные, неотклоненные на стадии 1)
var STAGE_OPEN = 5; // вскрытие конвертов
var STAGE_QUALIFICATION = 6; // Подведение итогов квалификационного отбора


var REQUEST_STATUS_EDIT_IZ = 5;
var REQUEST_EDIT_RIZ = 6;
var REQUEST_EDIT_GD = 7;
var REQUEST_EDIT_OOZ = 8;

// Для корректной проверки чекстайлов. Установка даты полных суток.
var NO_MAGIC_NUMBER_LAST_HOUR = 23;
var NO_MAGIC_NUMBER_LAST_MINUTE = 59;
var NO_MAGIC_NUMBER_LAST_SECOND = 59;

// Для корректной проверки чекстайлов.
var ETP_GRID_ROWS_LIMIT = 50;

/**
 * Статусы заявок
 */
// Добавлена, не подписана
var APPLICATION_STATUS_ADDED = 0;
// Подана, подписана.
var APPLICATION_STATUS_PUBLISHED = 1;
// Отменена или отозвана
var APPLICATION_STATUS_CANCELLED = 2;
// Принята.
var APPLICATION_STATUS_PROCESSED = 3;
// Отклонена.
var APPLICATION_STATUS_DECLINED = 4;
// Уклонилась от заключения ГК.
var APPLICATION_STATUS_FAILED = 5;
/*
 Отменена или отозвана, так как предыдущий цикл подачи заявок
 (например, предквалификация) прошла и теперь будут заново подаваться заявки.
 */
var APPLICATION_STATUS_OLD = 6;

/**
 * @deprecated
 * @see PROCEDURE_TYPE_AUCTION_ID
 * @type {number}
 */
var PROCEDURE_TYPE_AUC_ASC = 1; // Removed
/**
 * Replaced.
 *
 * @deprecated
 * @see PROCEDURE_TYPE_AUCTION_ID
 * @type {number}
 */
var PROCEDURE_TYPE_AUC_DESC = 2;
var PROCEDURE_TYPE_TENDER = 3;
var PROCEDURE_TYPE_PRICELIST_REQ = 5;
var PROCEDURE_TYPE_QUOTATION_REQ = 4;
var PROCEDURE_TYPE_QUALIFICATION = 6; // Removed
var PROCEDURE_TYPE_PERETORG_REDUC = 7; // Removed
var PROCEDURE_TYPE_PERETORG_TENDER = 8; // Removed
var PROCEDURE_TYPE_SMALL_PURCHASE = 9; // Малые закупки // Removed from db
// ТОРГИ В БУМАЖНОЙ ФОРМЕ
var PROCEDURE_TYPE_PAPER_SINGLE_SUPPLIER = 10;

/**
 * @deprecated
 */
var PROCEDURE_TYPE_PAPER_AUC_ASC = 11; // Removed

/**
 * @deprecated
 */
var PROCEDURE_TYPE_PAPER_AUC_DESC = 12;  // Removed

/**
 * @deprecated
 */
var PROCEDURE_TYPE_PAPER_TENDER = 13; // Removed

/**
 * @deprecated
 */
var PROCEDURE_TYPE_PAPER_QUOTATION_REQ = 14;  // Removed

/**
 * @deprecated
 */
var PROCEDURE_TYPE_PAPER_PRICELIST_REQ = 15; // Removed

/**
 * @deprecated
 */
var PROCEDURE_TYPE_PAPER_LIMITED_TENDER = 30; // Removed

/**
 * @deprecated
 */
var PROCEDURE_TYPE_PAPER_TWOSTEP_TENDER = 31; // Removed

var PROCEDURE_TYPE_AUC_ASC_26 = 20; // Removed from db
var PROCEDURE_TYPE_PUBLIC_SALE = 21; // Removed from db

var PROCEDURE_TYPE_COMPETITIVE_SELECTION = 32; // Removed
var PROCEDURE_TYPE_PAPER_COMPETITIVE_SELECTION = 33; // Removed

var PROCEDURE_TYPE_PREQUALIFY_SELECTION = 34; // Removed
var PROCEDURE_TYPE_PAPER_PREQUALIFY_SELECTION = 35; // Removed

var DEPARTMENT_ROLE_HEAD        = 1;  // Начальник профильного отдела
var DEPARTMENT_ROLE_SPECIALIST  = 2;  // Главный специалист профильного отдела
var DEPARTMENT_ROLE_EXPERT      = 3;  // Члены комиссии
var DEPARTMENT_ROLE_OTO         = 4;  // Сотрудники ОТО (организационно-технического отдела)

var COORDINATION_STATUS_COORDINATION  = 1;  // на согласовании
var COORDINATION_STATUS_RESOLVED      = 2;  // согласовано
var COORDINATION_STATUS_DECLINED      = 3;  // отклонено

var LOT_STEP_APPLIC_OPENED = 'new';                     // новая
var LOT_STEP_APPLIC_EDIT = 'edit';                     // новая
var LOT_STEP_APPLIC_OPENED = 'applic_opened';           // вскрытие конвертов
var LOT_STEP_FIRST_PARTS = 'first_parts';               // рассмотрение заявок
var LOT_STEP_TRADE = 'trade';                           // торги
var LOT_STEP_SECOND_PARTS = 'second_parts';             // подведение итогов
var LOT_STEP_EVALUATION = 'evaluation';                 // оценка заявок
var LOT_STEP_SELECTION = 'selection';                   // отбор заявок
var LOT_STEP_PERETORG_REDUC = 'peretorg_reduc';         // очная переторжка
var LOT_STEP_PERETORG_TENDER = 'peretorg_contest';      // заочная переторжка
var LOT_STEP_QUALIFICATION = 'qualification';           // квалификационный отбор
var LOT_STEP_PREQUALIFICATION = 'prequalification';     // преквалификация
var LOT_STEP_POSTQUALIFICATION = 'postqualification';   // постквалификация
var LOT_STEP_CORRECTION = 'correction';                 // подача окончательных предложений
var LOT_STEP_PROCEDURE_CORRECTION = 'procedure_correction';// редактирование извещения
var LOT_STEP_REGISTRATION = 'registration';             // прием заявок
var LOT_STEP_QUAL_REGISTRATION = 'qual_registration';   // прием предкационных квалифизаявок

var AUCTION_FEE = 3000;

var HUNDRED_PERCENTS = 100; // Для использования в формулах вида percent = value / HUNDRED_PERCENTS;
var ONE_KOPECK = 0.01; // Одна копейка
// Максимальная цена за единицу.
var MAX_PRICE = 999999999999;

var VOCAB_DOC_TYPE_EP9_DOC_ID = 25;
/*
 * End Constants
 */

function gettime()
{
  var d = new Date();
  return lz(d.getDate())+'.'+lz(d.getMonth()+1)+'.'+d.getFullYear()+' '+
    lz(d.getHours()+d.getTimezoneOffset()/60+3)+':'+
    lz(d.getMinutes())+':'+lz(d.getSeconds());
}

function href_to(link) {
  if ('/'==link.charAt(0)) {
    link = link.substr(1);
  }
  if (''==link) {
    link = '/';
  }
  return '#'+link.replace(/"/g, '&quot;');
}

function link_to(link, text, extra) {
  if (undefined == text) {
    text = link;
  }
  var attrs = [];
  if (extra) {
    if (extra.attrs) {
      for (var i in extra.attrs) {
        if (!extra.attrs.hasOwnProperty(i)) {
          continue;
        }
        attrs.push(i+'="'+extra.attrs[i].toString().replace(/"/g, '&quot;')+'"');
      }
    }
    if (extra.tip) {
      attrs.push('ext:qtip="'+extra.tip.replace(/"/g, '&quot;')+'"')
    }
  }
  return '<a href="'+href_to(link)+'"'+(attrs.length?(' '+attrs.join(' ')):'')+'>'+text+'</a>';
}

function redirect_to(link, hide_msg) {
  if (!Main.app) {
    document.location.href=href_to(link);
  } else {
    if (hide_msg) {
      Ext.Msg.hide();
    }
    Main.app.redirect(link);
  }
}

if (!String.prototype.escapeHtml) {
  String.prototype.escapeHtml = function() {
    if (Ext) {
      return Ext.util.Format.htmlEncode(this);
    }
    return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

if (!String.prototype.escapeUrl) {
  String.prototype.escapeUrl = function() {
    if (this.encodeURI) {
      return this.encodeURI();
    }
    return escape(this);
  }
}

if (!String.prototype.toString) {
  String.prototype.toString = function() {
    return this;
  }
}

if (!Array.prototype.unique) {
// Return new array with duplicate values removed
  Array.prototype.unique = function() {
    var a = [];
    var l = this.length;
    for(var i=0; i<l; i++) {
      for(var j=i+1; j<l; j++) {
        // If this[i] is found later in the array
        if (this[i] === this[j])
          j = ++i;
      }
      a.push(this[i]);
    }
    return a;
  };
}

function lz(a)
{
 return a.toString().length==1?'0'+a:a;
}

function formatDate(date)
{
  if ('string' == typeof date) {
    date = new Date(date);
  }
  return date.getFullYear()+'-'+lz(date.getMonth()+1)+'-'+lz(date.getDate())+' '+lz(date.getHours())+':'+lz(date.getMinutes())+':'+lz(date.getSeconds());
}

function formatTime(date)
{
  if ('string' == typeof date) {
    date = new Date(date);
  }
  return lz(date.getHours())+':'+lz(date.getMinutes())+':'+lz(date.getSeconds());
}

Ext.ux.cbGetState = function() {
	return {checked: this.getValue()};
}

Ext.ux.cbSetState  = function(state) {
	this.setValue(state.checked);
}

function humanizePrice(price) {
  var n = new NumberFormat(price);
  n.setSeparators(true, ' ', ',');
  n.setPlaces(2);
  return n.toFormatted();
}

function humanizeNumber(price) {
  var n = new NumberFormat(price);
  n.setSeparators(true, ' ', ',');
  n.setPlaces(-1);
  return n.toFormatted();
}

function openLink(link) {
  window.open(link);
  return false;
}

function externalLinkTo(link, text) {
  if (!text) {
    text = 'link';
  }
  text = text.toString().escapeHtml();
  return  '<a href="'+link+'" title="Ссылка откроется в новом окне" onclick="return openLink(\''+link+'\');">'+text+'</a>';
}

Ext.ux.SimpleTreeLoader = Ext.extend(Ext.util.Observable, {
  load : function(node, callback, scope){
    if (!node) {
      return false;
    }
    var tree = node.getOwnerTree();
    tree.load(node, callback, scope);
    return true;
  }
});

/**
 * @DEPRECATED
 */
function getCurrentView() {
  return Main.app.viewport.getComponent(0);
}

function echoResponseMessage(resp)
{
  if (!resp) {
    resp = {};
  }
  if (resp.failureType == 'server' && Ext.MessageBox.isVisible()) {
    // Уже отображается ошибка директа, не будем ее перебивать
    return;
  }
  if ( typeof resp.success == 'function' ) {
    resp = resp.result||{};
  }
  var title = resp.success?'Успешно':'Ошибка';
  var msg = resp.message||resp.msg;
  if (!msg) {
    msg = resp.success?'Документы и сведения направлены успешно':'Неизвестная ошибка';
  }
  Ext.MessageBox.alert(t(title), t(msg));
}


function setComboValue(combo, value, queryField) {
  var store = null;

  store = combo.store;
    store.load(
    {
       callback: function() {
          combo.setValue(value);
       },
       params:
       {
          query : value,
          queryfield : queryField
       }
    }
  );
  return true;
}

function defaultValue(value, dflt) {
  return (undefined==value || null==value)?dflt:value;
}

function checkSum(string, weights, mod1, mod2) {
  mod1 = defaultValue(mod1, 11);
  mod2 = defaultValue(mod2, 10);
  var sum = 0;
  var i;
  for (i=0; i<string.length; i+=1)
  {
    if (weights.length>i) {
      sum += parseInt(string.charAt(i), 10)*weights[i];
    }
  }
  sum %= mod1;
  sum %= mod2;
  return sum;
}

function checkSumINN(inn) {
  switch (inn.length)
  {
  case 10:
    var weights=[2,4,10,3,5,9,4,6,8,0];
    return ''+checkSum(inn, weights);
  case 12:
    var weights1=[7,2,4,10,3,5,9,4,6,8,0];
    var weights2=[3,7,2,4,10,3,5,9,4,6,8,0];
    return ''+checkSum(inn, weights1)+checkSum(inn, weights2);
  }
  return false;
}

/**
 * Вызывает Ext Direct метод, рисуя диалог «падажыте»
 * @param rpc_fn функция директа
 * @param params параметры функции (без каллбека)
 * @param displayparams параметры диалога
 *
 * Параметры диалога:
 *   mask: отображать диалог как маску (false)
 *   mask_el: элемент к которому применить маску (Ext.getBody())
 *   mask_class: класс к маске (x-mask-loading)
 *   wait_disable: не отображать никаких диалогов и масок
 *   wait_delay: интервал через который показать диалог (500 если не через маску, 0 если маской)
 *   wait_title: заголовок диалога
 *   wait_text: текст диалога или маски
 *   wait_icon: иконка диалога (Ext.MessageBox.INFO)
 *   wait_width: ширина диалога (400)
 *   exception_call: вызывать каллбек даже в случае эксцепшна в директе (false)
 *   confirm: спросить подтверждение операции, текст вопроса (null)
 *   confirm_title: заголовок вопроса подтверждения
 *   scope: скоуп вызова хендлера
 *   handle_failure: проверять пропертю success ответа. Если она false — показывать
 *   сообщение и не дергать каллбек.
 *   monitor_valid: проверять валидность указанного компонента, и не дергать каллбек если компонент
 *   уничтожен
 * Каллбек дергается также как и при простом вызове директа
 *
 * @param handler каллбек для функции директа
 */
function performRPCCall(rpc_fn, params, displayparams, handler) {
  var waiter = {};
  params = params||[{}];
  waiter.enable = true;
  waiter.shown = false;
  waiter.params = displayparams||{};
  if (!rpc_fn) {
    throw 'Internal error: no method specified';
  }
  if (waiter.params.mask) {
    waiter.params.mask_el = waiter.params.mask_el || Ext.getBody();
    waiter.params.wait_delay = waiter.params.wait_delay || 0;
  }
  waiter.params.scope = waiter.params.scope||window;
  waiter.params.wait_text = waiter.params.wait_text || 'Ваша операция выполняется';
  Ext.apply(waiter, {
    show: function(){
      if (!this.enable || this.params.wait_disable || Ext.Msg.isVisible()) {
        this.shown = false;
        return;
      }
      if (this.params.mask) {
        this.params.mask_el.mask(this.params.wait_text, this.params.mask_class||'x-mask-loading');
      } else {
        Ext.MessageBox.show({
          title: this.params.wait_title||'Пожалуйста подождите',
          msg: this.params.wait_text,
          width: this.params.wait_width||400,
          wait: true,
          icon: this.params.wait_icon||Ext.MessageBox.INFO
        });
      }
      this.shown = true;
    },
    hide: function() {
      this.enable = false;
      if (this.shown) {
        if (this.params.mask) {
          this.params.mask_el.unmask();
        } else {
          Ext.MessageBox.hide();
        }
      }
    },
    handler: function(result, e) {
      var is_exception = !result || !e;
      this.enable = false;
      if (this.params.mask || !is_exception) {
        this.hide();
      }
      if (Main && Main.app) {
        Main.app.un('rpcerror', this.clean);
      }
      if (!is_exception || this.params.exception_call) {
        if (this.params.handle_failure && result && false===result.success) {
          echoResponseMessage(result);
        } else {
          // проверяем уничтоженность компонентов
          if (this.params.monitor_valid && (this.params.monitor_valid.isDestroyed || this.params.monitor_valid.destroying)) {
            return;
          }
          handler.call(this.params.scope, result, e);
        }
      }
    },
    clean: function(event) {
      if (Main && Main.app) {
        Main.app.un('rpcerror', waiter.clean);
      }
      if (!waiter.params.mask) { // не перебиваем сообщение об ошибке системы
        this.shown = false;
      }
      waiter.hide();
      if (event && waiter.params.exception_call && !event.action && !event.method) {
        waiter.handler(null, event);
      }
    },
    rpccall: function() {
      if (0===this.params.wait_delay) {
        this.show();
      } else {
        this.show.defer(this.params.wait_delay||500, this);
      }
      params.push(this.handler.createDelegate(this));
      if (Main && Main.app) {
        Main.app.on('rpcerror', this.clean);
      }
      rpc_fn.apply(window, params);
    }
  });
  if (waiter.params.confirm) {
    Ext.MessageBox.confirm(waiter.params.confirm_title||'Подтверждение', waiter.params.confirm, function(b) {
      if ('yes'==b) {
        waiter.rpccall();
      }
    });
  } else {
    waiter.rpccall();
  }
}

function performAjaxRPCCall(url, callparams, displayparams, handler)
{
  var waiter = {};
  waiter.enable = true;
  waiter.shown = false;
  waiter.params = displayparams||{};
  waiter.fn = function(){
    if (!this.enable || this.params.wait_disable) {
      this.shown = false;
      return;
    }
    Ext.MessageBox.show({
      title: this.params.wait_title||'Пожалуйста подождите',
      msg: this.params.wait_text||'Ваша операция осуществляется',
      width: this.params.wait_width||400,
      wait: true,
      icon: this.params.wait_icon||Ext.MessageBox.INFO
    });
    this.shown = true;
  };
  waiter.hide = function() {
    this.enable = false;
    if (this.shown) {
      Ext.MessageBox.hide();
    }
  };
  waiter.errortext = function(xhr, opts) {
    var text = '';
    var time = new Date();
    text += ' Если ошибка повторяется, сообщите разработчикам, указав полный текст ошибки, включая отображаемый по нажатию на ссылку ниже.</div>';
    text += '<div>['+formatDate(time)+'] '+opts.url+'</div>';
    text += '<div id="server_response_link"><a href="javascript:;" onclick="$(\'#server_response_link\').hide();$(\'#server_response_text\').show();">Показать ответ сервера</a></div>';
    text += '<div id="server_response_text" style="display:none; background-color: white; border: 1px solid black; padding: 5px; margin: 5px 5px 0 5px;">'+(xhr.responseText||'<i>[empty]</i>')+'</div>';
    return text;
  }
  waiter.parseresult = function(xhr, opts) {
    this.hide();
    try {
      var resp = Ext.decode(xhr.responseText);
      return resp;
    } catch(e) {
      var text = '<div>Ошибка обработки ответа сервера. Проверьте наличие и работоспособность соединения с интернетом, перед повтором операции нажмите F5 для обновления страницы.</div>';
      text += this.errortext(xhr, opts);
      Ext.MessageBox.alert('Ошибка', text);
      return false;
    }
    //return null;
  }
  var rpccall = function() {
    var form = undefined;
    if (0===waiter.params.wait_delay) {
      waiter.fn();
    } else {
      waiter.fn.defer(waiter.params.wait_delay||500, waiter);
    }
    if (waiter.params.download) {
      form = {tag: 'form', style:"visibility: hidden; display:none;"};
      form = Ext.DomHelper.append(Ext.getBody(), form);
      waiter.enable = false;
    }
    var request = {
      url: url,
      method: 'POST',
      params: callparams,
      isUpload: waiter.params.download,
      form: form,
      success: function(xhr, opts) {
        if (waiter.params.download) {
          form = new Ext.Element(form);
          form.remove();
          //return;
        }
        var resp = waiter.parseresult(xhr, opts);
        if (waiter.params.handle_failure && resp && !resp.success) {
          handler = echoResponseMessage;
        }
        if (handler && (resp||waiter.params.call_on_fail)) {
          handler(resp);
        }
      },
      failure: function(xhr, opts) {
        var resp = waiter.parseresult(xhr, opts);
        if (resp && resp.msg) {
          var t={result: resp}
          failureHandler(null, t);
        } else {
          if (false!==resp) {
            var text = 'Ошибка запроса к серверу. Проверьте наличие и работоспособность соединения с интернетом. Попробуйте повторить операцию, предварительно обновив страницу нажав F5';
            Ext.MessageBox.alert('Ошибка', text);
          }
        }
        if (handler && waiter.params.call_on_fail) {
          handler(resp);
        }
      }
    };
    if (waiter.params.timeout) {
      request.timeout = waiter.params.timeout;
    }
    Ext.Ajax.request(request);
  };
  if (waiter.params.confirm) {
    Ext.MessageBox.confirm(waiter.params.confirm_title||'Подтверждение', waiter.params.confirm, function(b) {
      if ('yes'!=b) {
        return false;
      }
      rpccall();
    });
  } else {
    rpccall();
  }
}

function storeExceptionHandler(store, options, xhr, t, direct) {
  var resp;
  if (!xhr) {
    xhr = {};
  }
  try {
    if (direct && direct.result) {
      resp = direct.result;
    } else {
      resp = xhr.result||Ext.decode(xhr.responseText||'{}');
    }
    resp = resp.message||resp.msg||resp.exception||'Неизвестная ошибка';
  } catch(e) {
    resp  = xhr.responseText||'Неизвестная ошибка';
  }
  Ext.Msg.alert('Ошибка', resp);
}

function updateServerTimeOffset(server_tz, server_time) {
  if (undefined === server_tz || !server_time) {
    return;
  }
  var now = new Date();
  var tz_offset = -now.getTimezoneOffset()*60000;
  now = now.getTime();
  Main.server_time_offset=now - server_time + tz_offset - server_tz;
  Main.server_tz = server_tz;
  Main.server_time_offset_last_sync = now;
  if ( Main && Main.app && Math.abs(now - server_time)>5*60*1000 ) {
    Main.app.fireEvent('timeoffsetwarn', Math.abs(now - server_time));
  }
}

function deleteAccreditationFile(file_id, contragent_type, div_id) {
  Ext.Msg.confirm('Подтверждение', 'Вы действительно хотите удалить файл?', function(r) {if ('yes'==r) {
    RPC.File.deleteAccreditationFile(file_id, contragent_type, function(resp) {
      if (resp.success) {
        Ext.get(div_id).remove();
      } else {
        Ext.Msg.alert('Ошибка', resp.msg);
      }
    });
  }});
}

/**
 * Создание типового пейджера
 * @param msg название элементов, отображаемый в пейджере (элемент N из M)
 * @param store стор, к которому привязан пейджер
 * @param pagesize число элементов на страницу пейджера (опционально)
 * @param items дополнительные элементы пейджера (опционально)
 * @param LocalTimezone показывать сообщение о текущем времени
 * @return объект-конфиг пейджера
 */
function renderPagingToolbar(msg, store, pagesize, items, LocalTimezone) {
    LocalTimezone = LocalTimezone||false;
    if (LocalTimezone && Main.config.show_timezone){
        items.push('-');
        items.push({
                xtype: 'tbtext',
                cls: 'highlight-title',
                text: '<b>Время отображается по вашему локальному часовому поясу: ' + getLocalTimezone(true) + '</b>'
            });
    }

    return {
      xtype: 'pagingtoolbar',
      pageSize: pagesize||25,
      store: store,
      displayInfo: true,
      displayMsg: msg+" {0} - {1} из {2}",
      emptyMsg: "Список пуст",
      afterPageText: "из {0}",
      beforePageText: "Страница",
      items: items
    };
}

function renderStoreDownloadButton(store, url, limit, confirm, options, callback) {
  limit = limit || 500;
  confirm = confirm || false;
  options = options || {};
  var params = Ext.isDefined(options.params) ? options.params : {};
  var tooltip = Ext.isDefined(options.tooltip) ? options.tooltip : 'Скачать текущую выборку как таблицу Excel.<br/>\nТаблица будет включать первые ' + limit + ' элементов выборки с текущими параметрами фильтрации.';
  var cfg = {
    xtype: 'button',
    tooltip: tooltip,
    text: '',
    handler: function() {
      Ext.apply(params, store.baseParams);
      Ext.apply(params, {
        format: 'excel',
        start: 0,
        limit: limit
      });
      var sort = store.getSortState();
      if (Ext.isDefined(sort)) {
        Ext.apply(params, {
          sort: sort.field,
          dir: sort.direction
        });
      }
      var display = {
        download: true, wait_disable: true
      };
      if (Ext.isFunction(callback)) {
        params = callback(params);
      }
      if (confirm && getConfigValue('xls') && store.getTotalCount() > 100) {
        Ext.apply(display, {
          confirm: String.format('Выгрузка может занять продолжительное время. Вы действительно хотите выгрузить {0} процедур?', store.getTotalCount())
        });
      }

      //#TECHSUPPORT-2021
      if (store.getTotalCount() >= Main.config.count_excel_report_restriction)
      {
        Ext.Msg.alert('Внимание', 'Попытка выгрузить более ' + Main.config.count_excel_report_restriction + ' записей. Выгрузка невозможна. Уменьшите количество выгружаемых записей установив дополнительные фильтры.');
        return;
      }

      performAjaxRPCCall(url, params, display, echoResponseMessage);
    }
  };
  Ext.apply(cfg, options);

  if (Ext.isEmpty(cfg.iconCls) && Ext.isEmpty(cfg.icon)) {
    Ext.apply(cfg, {
      iconCls: 'icon-silk-disk'
    });
  }
  return cfg;
}

function getConfigValue(path, def) {
  var a = path.split(/\->/i);
  var r = Main.config;
  var found = true;
  Ext.each(a, function(p) {
    if (!Ext.isDefined(r[p])) {
      found = false;
      return false;
    }
    r = getObjectValue(r, p);
  });
  return found ? r : (def || false);
}

/**
 * Отмена изменений в сторе.
 * @param store стор, в котором необходимо отменить изменения
 * @return undefineds
 */
function rejectStoreChanges(store) {
  store.rejectChanges();
  store.each(function(r){
    if (r.phantom) {
      store.remove(r);
    }
  });
}

/**
 * Проверка вхождения gui в массив mandates
 * @param path gui
 * @param mandates массив прав доступа
 * @return true при наличии права, false при отсутствии
 */
function checkMandate(path, mandates) {
  var p = path.toLowerCase()+'/';
  for (var i = 0; i < mandates.length; i++) {
    if (mandates[i].url && p.indexOf(mandates[i].url.toLowerCase()+'/') >= 0) {
      return true;
    }
  }
  return false;
}

/**
 * Создание меню в зависимости от прав доступа пользователя
 * @param mandates массив прав доступа
 * @param all_menues массив всех менюшек
 * @param mandatesMenu объект прав на менюшки
 * @return объект Toolbar с менюшками
 */
function buildUserMenuBar(mandates, all_menues, mandatesMenu) {
  if (!mandatesMenu) {
    mandatesMenu = {};
  }
  var menues = [];
  var i, j, m, t, idx, data;

  function findMenu(menu, title) {
    for (var i=0; i<menu.length; i++) {
      if (menu[i].text == title) {
        return i;
      }
    }
    return -1;
  }
  for (i=0; i<all_menues.length; i++) {
    if (!(all_menues[i].id in mandatesMenu)) {
      if (!all_menues[i].menupath) {
        continue;
      }
      if (all_menues[i].url && ''!=all_menues[i].url && !checkMandate(all_menues[i].url, mandates) && all_menues[i].menupath!='-') {
        continue;
      }
    } else if (mandatesMenu[all_menues[i].id].mode == false) {
      continue;
    }

    m = all_menues[i].menupath.split('/');
    t = menues;
    if (all_menues[i].menupath=='-') {
      t.push({
        xtype: 'tbseparator',
        weight: all_menues[i].weight
      });
      continue;
    }
    for (j=0; j<m.length-1; j++) {
      idx = findMenu(t, m[j]);
      if (idx<0) {
        t.push({
          text: m[j],
          weight: false,
          menu: {
            xtype: 'menu',
            items: []
          }
        });
        idx = t.length-1;
      }
      if (!t[idx].menu) {
        t[idx].menu = {
          xtype: 'menu',
          items: []
        }
      }
      t = t[idx].menu.items;
    }
    idx = findMenu(t, m[j]);
    data = {
      text: m[j]
    };
    if (all_menues[i].icon) {
      data.icon = all_menues[i].icon;
    }
    if (all_menues[i].weight) {
      data.weight = all_menues[i].weight;
    }
    if (all_menues[i].url) {
      if (all_menues[i].url == 'auth/logout') {
        data.handler =  (function(url){return function(){
          if (url) {
            Ext.Msg.show({
              title: 'Выход',
              msg: 'Вы уверены, что хотите завершить работу в АСУЗД?',
              buttons: Ext.Msg.YESNO,
              icon: Ext.MessageBox.QUESTION,
              fn: function(result) {
                switch(result){
                  case 'yes':
                    redirect_to(url);
                    break;
                  case 'no':
                    break;
                  case 'cancel':
                    break;
                }
              }
            });
          }
        }})(all_menues[i].url);
      } else if (m.length<=1) {
        data.handler =  (function(url){return function(){redirect_to(url);}})(all_menues[i].url);
      }
      data.href =  '#'+all_menues[i].url;
    } else {
      data.menu = {xtype: 'menu', items: []};
      if (idx>=0) {
        data.menu.items = t[idx].menu.items;
      }
    }
    if (idx<0) {
      t.push(data);
    } else {
      Ext.apply(t[idx], data);
    }
  }
  function menuSort(menu) {
    for (var i=0; i<menu.length; i++) {
      if (menu[i].menu) {
        menuSort(menu[i].menu.items);
        if (false===menu[i].weight) {
          menu[i].weight = menu[i].menu.items[0].weight;
        }
      }
    }
    menu.sort(function(a, b){
      return a.weight - b.weight;
    })
  }
  function menuClean(menu) {
    for (var i=0; i<menu.length; i++) {
      if (menu[i].menu) {
        menuClean(menu[i].menu.items);
        if (0 == menu[i].menu.items.length) {
          menu.splice(i, 1);
          i--;
        }
      }
    }
  }
  menuClean(menues);
  menuSort(menues);
  if (menues.length>1) {
    t = menues.pop();
    menues.push('->');
    menues.push(t);
  }
  return new Ext.Toolbar({
    xtype: 'toolbar',
    cls: 'user-menu-bar',
    autoHeight: true,
    width: 'auto',
    items: menues
  });
}

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * @param obj1
 * @param obj2
 * @returns obj3 a new object based on obj1 and obj2
 */
function merge_options(obj1, obj2){
    var obj3 = {};
    for (var attrname in obj1) {obj3[attrname] = obj1[attrname];}
    for (var attrname in obj2) {obj3[attrname] = obj2[attrname];}
    return obj3;
}

/**
 * Инсертит загруженные доки в файлопанели.
 */
function loadFilesIntoFilePanels(files, params, withHash) {
  if(files != null) {
    var req_id=0, req_files=null, file_html = '';
    for (var i=0; i<files.length; ++i) {
      req_id = files[i].req_id;
      if (!files[i].html.length) {
        req_files = [];
      } else {
        req_files = files[i].html;
      }
      var panel = Ext.getCmp('files_uploaded_'+(req_id||''));
      if (panel) {
        for (var j=0; j<req_files.length; ++j) {
          file_html = getFileInfoPanel(req_files[j], params, withHash);
          panel.add(file_html);
        }
        panel.doLayout();
      }
    }
  }
}

/**
 * Standard form submit (with files)
 *
 * @param {Ext.form.FormPanel} form     Компонент с формой.
 * @param {String}  url                 Адрес, куда редиректить после успешной отправки.
 * @param {String}  eventName           Событие, которое сфайрить после успешной отправки.
 * @param {Boolean} respToEvent         Если true, файрить eventName с объектом response, иначе файрить с form.
 * @param {Boolean} showResponseMessage false для отключения показа сообщения о результате.
 *
 * @return void
 *
 */
function performSave(form, url, eventName, respToEvent, showResponseMessage) {
  if (respToEvent===undefined) respToEvent = false;
  if (showResponseMessage===undefined) showResponseMessage = true;
  form.getForm().submit({
    waitMsg: 'Отправляем данные',
    success: function(provider, resp) {
      if (showResponseMessage) echoResponseMessage(resp);

      if (eventName) {
        if (respToEvent) {
          form.fireEvent(eventName, resp);
        } else {
          form.fireEvent(eventName, form);
        }
      }

      if(url!=null && url!==undefined) {
        redirect_to(url);
      }
    },
    failure: function(provider, resp) {
      echoResponseMessage(resp);
    }
  });
  return;
}

/**
 * Создает кнопку с хандлером-редиректом
 *
 * @param {String} txt   - Текст на кнопке
 * @param {String} url   - Адрес, куда переадресовывать
 *
 * @return void
 *
 */
function createSimpleRedirectButton(txt, url) {
  return {
    xtype: 'button',
    text: txt,
    handler: function() {
      redirect_to(url);
    }
  };
}

/**
 * Проходит по компоненту и всем его элементам, и пытается вытащить значения из
 * всех полей. Вытаскивает следующим образом: если у компонента есть аттрибут
 * name и функция getValue/getValues то результат этой функции заносится в объект
 * v пропертей с именем name. Если такая пропертя уже есть — создается массив
 * из всех таких пропертей. Если имя проперти заканчивается на «[]», то массив
 * создается всегда, а «[]» из имени удаляется
 * @param p компонент
 * @param v объект, в который помещаются значения
 * @param ignoreself — игорирует сам объект, сразу идет по субкомпонентам (актуально
 * если компонент пытается собрать значения по самому себе), по умолчанию true
 */
function collectComponentValues(p, v, ignoreself) {
  var val;
  var fn;
  var name;
  var array = false;
  if (p.disabled) {
    return;
  }
  if (!ignoreself && p.name) {
    if (p.getValues) {
      fn = 'getValues';
    } else if (p.getValue) {
      fn = 'getValue';
    }
    if (fn) {
      val = p[fn]();
      if (undefined===val) {
        return;
      }
      if (val && val.getRawValue && Ext.isFunction(val.getRawValue)) {
        val = val.getRawValue();
      }
      name = p.name;
      if (name.match(/\[\]$/)) {
        array = true;
        name = name.replace(/\[\]$/, '');
        if (!v[name]) {
          v[name] = [];
        }
      } else if (undefined !== v[name] ) {
        if (!Ext.isArray(v[name])) {
          v[name] = [v[name]];
        }
        array = true
      }
      if (array) {
        v[name].push(val);
      } else {
        v[name] = val;
      }
    }
  }
  if (!fn && p.items && p.items.each) {
    p.items.each(function(p){collectComponentValues(p, v);});
  }
}

function getFieldValue(f) {
  var cmp = Ext.getCmp(f);
  if (cmp) {
    return cmp.getValue();
  }else{
    return null;
  }
}

function setFieldValue(f, v) {
  var cmp = Ext.getCmp(f);
  if (cmp) cmp.setValue(v);
}

function setComponentValues(cmp, v, ignoreself) {
  var cmp_name = (cmp.name != undefined) ? cmp.name.replace(/\[\]/, '') : undefined;
  if (!ignoreself
      && cmp_name
      && undefined!==v[cmp_name]
      && 'null'!=v[cmp_name]
      && (cmp.setValue||cmp.setValues))
  {
    if (cmp.setValues) {
      cmp.setValues(v[cmp_name]);
    } else if (cmp.setValue) {
      cmp.setValue(v[cmp_name]);
      cmp.fireEvent('valueFilled', v[cmp_name]);
      cmp.fireEvent('change');
    }
  } else if (cmp.items && cmp.items.each) {
    cmp.items.each(function(i){setComponentValues(i, v)});
  }
}

function autoSetValue(cmp) {
  if (cmp.value) {
    //cmp.on('afterrender', function(){
      if (cmp.setValues) {
        cmp.setValues(cmp.value);
      } else if (cmp.setValue) {
        cmp.setValue(cmp.value);
      } else {
        setComponentValues(cmp, cmp.value, true);
      }
      delete cmp.value;
    //}, cmp, {once: true});
  }
}

function getLocalTimezone(full) {
  var now = new Date();
  var time = 'GMT&nbsp;'+now.format('P');
  return time;
}

/**
 * Выдает html код с информациеей о файле
 * @param f объект с метаданными файла
 * @return string html код
 */
function getFileInfoHtml(f, withHash) {
  if (!f) return '';
  if(Ext.isEmpty(withHash)) withHash = true;

  var f_descr = ((undefined!==f.descr) ? f.descr : '');
  var f_description = ((undefined!==f.description) ? f.description : '');
  var f_name = ((undefined!==f.name) ? f.name : '');
  var file_title = (f_descr||f_description||f_name);

  var r= (f.link?('<a href="'+f.link+'" target="_blank">'):'')+
          file_title.escapeHtml()+
         (f.link?'</a>':'')+
         (undefined!==f.size && 0!=f.size?(', размер '+Ext.util.Format.humanizeSize(f.size)):'')+
         ((undefined!==f.hash && withHash) ?(', контрольная сумма ГОСТ Р34.11-94:  '+f.hash):'')+
         (undefined!==f.date_added||undefined!==f.date?(', добавлен '+Ext.util.Format.localDateRenderer(f.date_added||f.date)):'');
  if (f.obsolete) {
    r = '<span class="not-actual">'+r+' ('+(f.obsolete_text||'неактуален')+')</span>';
  } else {
    if(f.oos_publish_link) {
       r += '&nbsp;&nbsp;'+ f.oos_publish_link;
    }
  }
  return r;
}

/**
 * Выдает конфиг для панели с информацией о файле
 * @param file объект с метаданными файла
 * @param params опциональко, конфиг отображения. Возможные параметры:
 *   deleteHandler: функция-каллбек для удаления файла (если ее нет, то удалялка
 *   не отображается);
 *   deleteIcon: путь к иконке удаления (по умолчанию корзинка)
 *   deleteText: текст ссылки на удаление.
 * @return объект-конфиг панели
 */
function getFileInfoPanel(file, params, withHash) {
  var p = {
    border: false,
    cls: 'spaced-bottom-shallow',
    file: file,
    html: getFileInfoHtml(file, withHash)
  };
  params = params||{};
  var file_delete_handler = null;
  if (file && file.deleteHandler && !params.deleteHandler) {
    file_delete_handler = file.deleteHandler;
  }
  if (undefined!==file.descr){
  if (params.deleteHandler || file_delete_handler) {
    var delete_id = Ext.id();
    p.html += '&nbsp;<a href="javascript:;"><img src="'+(params.deleteIcon||'/ico/garbage.png')+
              '" ext:qtip="'+(params.deleteText||'Удалить файл')+'" id="'+delete_id+'"/></a>';
    p.listeners = {
      afterrender: function(cmp) {
        var d = Ext.get(delete_id);
        d.on('click', function(){
          Ext.Msg.confirm('Подтверждение',
                          'Вы действительно хотите удалить файл «'+cmp.file.name.escapeHtml()+'»?',
                          function(b){
                            if (b=='yes') {
                              if (file_delete_handler) {
                                file_delete_handler(cmp.file, cmp);
                              } else {
                                params.deleteHandler(cmp.file, cmp);
                              }
                            }
                          });
        });
      }
    }
  }
  }
  return p;
}

/**
 * Добавляет события events в объект component
 * @param component компонент куда добавить
 * @param events массив строк с именами евентов
 */
function addEvents(component, events) {
  for (var i=0; i<events.length; i++) {
    component.addEvents(events[i]);
  }
}

function getViewEl() {
  if (Main && Main.layout && Main.layout.center_panel) {
    return Main.layout.center_panel.getEl();
  } else {
    return Ext.getBody();
  }
}

/**
 * Парсит строку с датой-временем по стандартным паттернам (iso, db и т.п.)
 * @param date строка с датой
 * @param formats форматы, массив или строка, по умолчанию все типовые паттерны
 * @return Date JS-объект даты или null
 */
function parseDate(date, formats) {
  var d;
  if (Ext.isDate(date)) {
    return date;
  }
  if (!formats) {
    formats = ['c', 'Y-m-d H:i:sp', 'Y-m-d H:i:s.u', 'Y-m-d H:i:s.up', 'Y-m-d H:i:s'];
  }
  if (!Ext.isArray(formats)) {
    formats = [formats];
  }
  for (var i=0; i<formats.length; i++) {
    if (formats[i].match(/p$/)) {
      var fmt = formats[i].substr(0, formats[i].length-1)+'O';
      d = Date.parseDate(date+'00', fmt);
    } else {
      d = Date.parseDate(date, formats[i]);
    }
    if (d) {
      return d;
    }
  }
  return null;
}

function substr_count(haystack, needle) {
  var cnt = 0;
  var i;
  if (''==needle) {
    return null;
  }
  while ( (i=haystack.indexOf(needle))>=0 ) {
    haystack = haystack.substr(i+needle.length);
    cnt++;
  }
  return cnt;
}

/**
 * Пытается распарсить строку с ценой, при этом восприняв разделители и т.п.
 * @param string цена в виде строки
 * @return Number цена в виде числа
 */
function parsePrice(string) {
  if (Ext.isNumber(string)) {
    return string;
  }

  if (!Ext.isString(string)) {
    return false;
  }

  string = string.replace(/[ ']+/g, '');
  if ( string.indexOf(",")>=0 && string.indexOf(".")>=0 )
  {
    string = string.replace(/,/g, '.');
    var pos = string.lastIndexOf('.');
    if (pos>=0)
    {
      string=string.substr(0, pos).replace(/\./g, '') + string.substr(pos);
    }
  }
  if ( 1==substr_count(string, ",") )
  {
    string = string.replace(',', ".");
  }

  if (string.search(/^([+-])?[0-9]+(\.[0-9]+)?([eE][+-][0-9]+)?$/)<0)
  {
    return false;
  }
  return Number(string);
}

/**
 * Форматирует число в соответствии с заданной конфигурацией
 * @param {float} v
 * @param {object} cfg {
 *   before: '' //произвольные символы, которые будут вставлены перед числом (по-умолчание ничего)
 *   after: '' //произвольные символы, которые будут вставлены после числа (по-умолчание ничего)
 *   decimals: null //число десятичных знаков (по-умолчанию null означает, что число не округляется)
 *   dec_point: ',' разделитель между целой и дробной частями числа (по-умолчанию ',')
 *   thousands_sep: ' ' — разделитель тысяч в целой части числа (по-умолчанию ' ')
 * }
 * @return {string}
 */
function number_format(v, cfg){
  function obj_merge(obj_first, obj_second){
    var obj_return = {};
    for (var key in obj_first) {
      if (typeof obj_second[key] !== 'undefined') {
        obj_return[key] = obj_second[key];
      } else {
        obj_return[key] = obj_first[key];
      }
    }
    return obj_return;
  }
  function thousands_sep(n, sep){
    return (n.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + sep));
  }
  if (typeof v !== 'number'){
    v = parseFloat(v);
    if (isNaN(v)) return v;
  }
  var cfg_default = {before: '', after: '', decimals: null, dec_point: ',', thousands_sep: ' '};
  if (cfg && typeof cfg === 'object'){
    cfg = obj_merge(cfg_default, cfg);
  } else {
    cfg = cfg_default;
  }
  var v1 = v.toString();
  if (cfg.decimals !== null){
    v1 = v.toFixed(cfg.decimals);
  }
  var v_arr = v1.split('.');
  var nf = thousands_sep(v_arr[0], cfg.thousands_sep);
  if (2 === v_arr.length) {
    nf = nf + cfg.dec_point + v_arr[1];
  } 
  return cfg.before + nf + cfg.after;
}

/**
 * Возвращает объект Date с текущим временем
 */
function now() {
  return new Date();
}

/**
 * Возвращает объект Date с текущим серверным временем
 */
function getServerTime() {
  if (undefined===Main.server_time_offset) {
    return null;
  }
  var date_s = new Date();
  date_s.setTime(date_s.getTime() - Main.server_time_offset);
  var diff = Math.round(Math.abs(Main.server_tz)/1000);
  var server_tz = (Main.server_tz>=0?'+':'-')+
                  lz(Math.floor(diff/(60*60)))+':';
  diff = diff%(60*60);
  server_tz += lz(Math.floor(diff/60));
  return Date.parseDate(date_s.format('Y-m-d\\TH:i:s')+server_tz, 'c');
}

/**
 * Поставщик ли организация текущего пользователя?
 * @returns bool
 */
function isSupplier() {
  return (Main.contragent && Main.contragent.supplier_accreditations && Main.contragent.supplier_accreditations.length);
}

/**
 * Поставщик ли организация текущего пользователя (с учетом принятой аккредитации)?
 * @returns bool
 */
function isSupplierAccred() {
  return (Main.contragent && Main.contragent.supplier_accreditations && Main.contragent.supplier_accreditations.length
            && Main.contragent.supplier_accreditations[0]['status'] == 3);
}

/**
 * Заказчик ли организация текущего пользователя?
 * @returns bool
 */
function isCustomer() {
  return (Main.contragent && Main.contragent.customer_accreditations && Main.contragent.customer_accreditations.length);
}

/**
 * является ли организация - экспертом
 * @returns bool
 */
function isExpert() {
  return (Main && Main.contragent && Main.contragent.is_expert);
}

/**
 * Заказчик ли организация текущего пользователя (с учетом принятой аккредитации)?
 * @returns bool
 */
function isCustomerAccred() {
  return (Main.contragent && Main.contragent.customer_accreditations && Main.contragent.customer_accreditations.length
            && Main.contragent.customer_accreditations[0]['status'] == 3);
}

/**
 * Является ли организация текущего пользователя спецоргом
 * @returns bool
 */
function isCustomerSpecorg() {
  return (Main && Main.contragent && Main.contragent.customer_profile_id == 2);
}

function isAdmin() {
  return Main && Main.user && Main.user.has_role_admin;
}

function isCustomerAdmin(){
    return Main && Main.user && Main.user.is_customer_admin;
}

/**
 * Гость ли пользователь?
 * @returns bool
 */
function isGuest() {
  return !Main || !Main.user || (Main.user.role == 'guest');
}


/**
 * Задаёт или очищает сообщение для всех, сверху под логотипом.
 * @param {String} announcement Текст сообщения, fale или пустой текст для очистки.
 */
function setAnnouncement(announcement) {
  var el = Ext.get('layout_announcement_panel');
  if (!el) return false;

  // Очищаем содержимое
  var btn = el.child('.announcement-close-button');
  if (btn)
    btn.remove();
  el.update('');

  if ( announcement && !isGuest() ) {
    var hideHash = Ext.util.MD5(announcement);
    if  ( hideHash === Ext.state.Manager.get('hideAnnouncementHash', null) )
      return false;
    var txtEl = el.createChild({
      cls       : 'announcement',
      width     : '100%',
      html      : announcement
    }).createChild({
      tag       : 'a',
      href      : '#',
      html      : '',
      title     : 'Скрыть это объявление',
      cls       : 'announcement-close-button'
    }).on('click', function(event, el) {
      Ext.state.Manager.set('hideAnnouncementHash', hideHash);
      Ext.getCmp('layout_center_outer_panel').doLayout();
      setAnnouncement('');
      event.stopEvent();
      return false;
    });
  }
  return el.repaint();
}

function clearCookies() {
  if (Main && Main.session_name) {
    //Ext.util.Cookies.clear(Main.session_name);
    var session_name = Main.session_name;
    var date = new Date();
    date.setTime(date.getTime()-24*3600*1000); // expires day ago
    document.cookie = session_name + "=; expires="+date.toGMTString();
  }
}

/**
 * Вызывает callback со всеми компонентами, иды которых переданы в первом параметре
 * @param components array массив с идами компонентов
 * @param callback funxtion вызывается с одним параметром: компонентом
 */
function callComponents(components, callback) {
  var cmp;
  for (var i=components.length-1; i>=0; i--) {
    cmp = Ext.getCmp(components[i]);
    if (cmp) {
      callback(cmp);
    }
  }
}

/**
 * Очищает любой компонент как форму
 */
function cleanFormItems(form) {
  if (form && form.items && form.items.each) {
    form.items.each(function(e) {
      if (e instanceof Application.components.combo) {
        e.setValue(null);
      } else if (e.clearValue) {
        e.clearValue();
      } else if (e.reset) {
        e.reset();
      } else if (e.items) {
        cleanFormItems(e);
      }
    });
  }
}

/**
 * Отложенный биндинг RPC функции
 * @param rpc_fn String имя RPC функции
 * @return Function распознанная функция или прослойка для более позднего распознавания
 */
function RPCBind(rpc_fn) {
  var rpc_path = rpc_fn.split('.');
  function getFn() {
    var fn = window;
    for (var i=0; i<rpc_path.length; i++) {
      fn = fn[rpc_path[i]];
      if (!fn) {
        return null;
      }
    }
    return fn;
  }
  var fn = getFn();
  if (fn) {
    return fn;
  }
  return function() {
    fn = fn || getFn();
    if (fn) {
      return fn.apply(this, arguments);
    }
    return false;
  }
}

/**
 * Валидирует любой компонент как форму
 */
function isFormValid(form) {
  var valid = true;
  if (form && form.items && form.items.each) {
    form.items.each(function(e) {
      if (e.isValid) {
        valid = e.isValid() && valid;
      } else if (e.items) {
        valid = isFormValid(e) && valid;
      }
    });
  }
  return valid;
}

function logout(hide_msg) {
  if (hide_msg) {
    Ext.Msg.hide();
  }
  RPC.Authentication.logout(null, function(provider, response){
    clearCookies();
    Main.reloadPrivileges();
  });
}

function renderTip(text, params) {
  params = params||{};
  return '<sup><span style="cursor:pointer; text-decoration:underline; color:'+(params.color||'darkblue')+';'+
        ' white-space:nowrap; font-weight:normal;" ext:qtip="'+text+'">[?]</span></sup>';
}

function performStoreSearch(store, query, advanced_query) {
  /*if (query) {
    query = query.toLowerCase();
  }*/
  var aq = advanced_query||{};
  aq.query = query;
  if (aq) {
    for (var sp in aq) {
      if (!aq.hasOwnProperty(sp)) {
        continue;
      }
      store.setBaseParam(sp, aq[sp]);
    }
  }
  if (store.baseParams) {
    //delete store.baseParams.limit;
    delete store.baseParams.start;
  }
  store.load();
}


/**
 * Удостовериться, что стор загружен и выполнить каллбек по факту его заполнения.
 * Если стор не загружен, то он будет загружен, а если и так загружен — каллбек
 * будет выполнен сразу
 * @param {type} store
 * @param {type} callback
 * @param {type} scope
 * @returns {undefined}
 */
function ensureStoreLoaded(store, callback, scope) {
  if (Ext.isEmpty(store.lastOptions) && !store.autoLoad) {
    // стор никогда не грузился, лоадим
    store.load({
      callback: callback,
      scope: scope
    });
  } else if (callback && !Ext.isEmpty(store.totalLength)) {
    // стор загружен
    callback.call(scope);
  } else if (callback) {
    // стор в процессе загрузки
    store.on('load', callback, scope, {single: true});
  }
}

/**
 * Инициализация Id
 * @param array ids - массив названий переменных для инициализации ['field1_id', 'field2_id']
 * @return object ids - объект переменных с проинициализированными Id'ами
 */
function initIds(ids) {
  var result = {};
  for(var cnt = ids.length; cnt--;) {
    result[ids[cnt]] = Ext.id();
  }
  return result;
}

/**
 * аналог php функции in_array
 * @param needle
 * @param haystack
 * @returns {boolean}
 */
function in_array(needle, haystack) {
    for(var i in haystack) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

/*
 * Выводит сообщение об ошибках формы
 */
function showFormErrors(form) {
  if (form && form.items && form.items.each) {
    var err_msg = '';
    form.items.each(function(item){
      if (!item.isValid()) {
      err_msg += '<b>' + item.fieldLabel + ':</b> ' + item.getActiveError() + '<br>';
      }
    });
    Ext.MessageBox.alert('Ошибка', err_msg);
  }
}

var isAllOf = function(a, r) {
  if (a.tooltip=='Поданные заявки'){
      //task-3617
      var isOrganizer = r.data.organizer_contragent_id == Main.contragent.id;
      if (isCustomer() && r.data.procedure_type == PROCEDURE_TYPE_QUOTATION_REQ && isOrganizer && r.json.is_applics_view){
          return false;
      }

      if (Main.user && Main.user.allow_view_apps) {
         return false;
      }
  }
  for (var i=0; i<r.data.lots.length; i++) {
    if (!a.isHiddenInLot(r, r.data.lots[i])) {
      return false;
    }
  }
  return true;
};

var calculateStatusNumber = function(column, record, name) {
  var name = name||'lots';
  var data = record.data[name];
  var maxStatus = 0 ;
  var lots_number = data.length;
  for (var i=0; i<lots_number; i++) {
    if(data[i][column] && 
            (lots_number == 1 || data[i][column] != Application.models.Procedure.statuses.cancelled)) {
      maxStatus = (maxStatus > data[i][column]) ? maxStatus : data[i][column];
    }
  }
  if (lots_number>1 && maxStatus==0) {
    var status = 0;
    for (var i=0; i<lots_number; i++) {
      if (data[i][column]) {
        status = (Application.models.Procedure.statuses.cancelled==data[i][column])? Application.models.Procedure.statuses.cancelled : data[i][column];
      }
    }
    maxStatus = status;
  }
  return maxStatus;
};

var lotActionHandler = function(location, confirm) {
  return function(grid, rowIndex, colIndex, gitem, e, lot) {
    var item = grid.getAt(rowIndex);
    if (!item || !item.data || !item.data.lots || !item.data.lots.length) {
      return;
    }
    if (1==item.data.lots.length || undefined!==lot) {
      if (!lot) {
        lot = 0;
      }
      var template = new Ext.Template(location);
      if (item) {
        var data = {lot_id: item.data.lots[lot].id, procedure_id: item.data.id};
        var dst = template.apply(data);
        if (confirm) {
          Ext.Msg.confirm('Подтверждение', confirm, function(r) {
            if ('yes'==r) {
              redirect_to(dst);
            }
          });
        } else {
          redirect_to(dst);
        }
      }
    } else {
      grid.getExpander().expandRow(rowIndex);
      //var row = view.getRow(rowIndex).fireEvent('expand');
    }
  }
}

/**
 * Устаревшая функция проверки видимости кнопок.
 *
 * @param {*} button_pseudo  Название кнопки.
 * @param {*} current_step   Текущий шаг.
 * @param {*} procedure_type Тип процедуры.
 * @param {*} status         Статус.
 * @param {*} actual         Актуальность.
 *
 * @deprecated
 * @see Application.models.Po_Procedure.hideActionButton
 *
 * @return {boolean} Да/Нет.
 */
var isButtonVisible = function(button_pseudo, current_step, procedure_type, status, actual) {
  //2014/04/29 ptanya Параметр status не нужен, так как теперь current_step приходит конечный из Application.models.Procedure.getCurrentStepPseudo
  if (actual===false) return false;
  if(!current_step && undefined !== status) {
    current_step = LOT_STEP_REGISTRATION;
  }
  var step_data = Application.models.Procedure.getStep(current_step);
  if(!step_data.links) return false;
  var visibles = step_data.links.defaults;
  var proctype = Application.models.Procedure.type_ids[''+procedure_type];
  if(step_data.links[proctype]) {
    visibles = step_data.links[proctype];
  }

  if(visibles.indexOf(button_pseudo)>=0) {
    return true;
  }
  return false;
}

var doc_pend = function(v,m,r) {
  return 'Запросы: +' + r.data.pending_doc_request_number;
}
var app_pend = function(v,m,r) {
    numb = 0;
    if (r.data.pending_applic_request_number){
    for (j=0; j< r.data.pending_applic_request_number.length; j++){
        numb = numb + r.data.pending_applic_request_number[j]['applic_request'];
        }}
            return 'Запросы: +' + numb;
}

var Translate = {
  store: null,

  _: function(message) {
    if (!Main.config.translates) {
      return message;
    }
    if (this.store == null) {
      this.store = new Ext.data.ArrayStore({
        autoDestroy: true,
        idIndex: 0,
        data: Main.config.translates,
        fields: ['key', 'value']
      });
    }
    var translate = false;
    var rec = this.store.getById(message);
    if (rec) {
      translate = rec.get('value');
    }
    if (translate) {
      return translate;
    }
    return message;
  }
}

function t(message) {
  return Translate._(message);
}
