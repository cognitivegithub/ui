/* eslint-disable */
var CryptoPlugin = {};

var eds = function () {
  /**
   *
   * Работа с Криптопро browser plugin
   *
   * User: cyrill
   * Date: 21.07.13
   * Time: 17:06
   */

  //var CryptoPlugin = {};

  var CADESCOM_CADES_BES = 0x01;
  var CADESCOM_CADES_X_LONG_TYPE_1 = 0x5d;
  var CAPICOM_CURRENT_USER_STORE = 2;
  var CAPICOM_MY_STORE = "My";
  var CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED = 2;
  var CAPICOM_CERTIFICATE_FIND_SUBJECT_NAME = 1;
  var CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN = 1;


  var CADESCOM_STRING_TO_UCS2LE = 0x00;
  var CADESCOM_BASE64_TO_BINARY = 0x01;

  var SIGN_ERRORS = {
    0x800B010A : 'Корневой сертификат не добавлен в список доверенных на локальном ПК или вышел срок действия сертификата. Обратитесь в службу технической поддержки.',
    0x8009200B : 'Не найден приватный ключ привязанный к сертификату. Обратитесь в службу технической поддержки.',
    0x80093101 : 'Используемый сертификат не является сертификатом квалифицированной электронной подписи. Обратитесь в службу технической поддержки.',
    0x80090016 : 'Не найден приватный ключ привязанный к сертификату',
    0x80092004 : 'Сертификат не корректно установлен через систему Крипто Про!'
  };

  var install_message = '<b>Подключение к механизму подписания не доступно на вашем компьютере!</b><br/><br/>' +
    'Обратите внимание! Для работы с ЭП вам необходимо иметь:' +
    '<ul class="disced"><li>Компьютер под управлением Windows, Linux или FreeBSD</li>' +
    '<li>Один из современных браузеров (Internet Explorer, Mozilla Firefox, Opera, Chrome, Safari) с поддержкой сценариев JavaScript</li>' +
    '<li>Установленный плагин для браузера «КриптоПро ЭЦП Browser plug-in» ' +
    '(<a href="/resources/cryptopro/cadesplugin.exe">Установить</a>)</li>' +
    '<li>Установленный сертификат ключа подписи</li>' +
    '<li>Для работы в Firefox версии 52 и выше требуется дополнительно установить '+
    '<a href="/resources/cryptopro/firefox_cryptopro_extension_latest.xpi">расширение для браузера</a></li></ul>';

  var DN_FIELDS_DESCRIPTION = {
    E: 'E-mail',
    CN: 'Полное имя',
    T: 'Должность',
    OU: 'Подразделение',
    O: 'Организация',
    L: 'Город/село',
    SP: 'Область/район',
    S: 'Регион',
    C: 'Страна',
    INN: 'ИНН',
    OGRN: 'ОГРН',
    SNILS: 'СНИЛС'
  };

  /**
   * Какая версия плагина используется, ассинхронная (на промисах) или старая.
   * @type {boolean}
   */
  var isCadesPluginAssync = true;

  /**
   * Создает объект используя cadesplugin
   * Если браузер поддерживает ассинхронность, то CreateObjectAsync
   * В противном случае стандартный CreateObject
   *
   * @param string name наименование нужного объекта cades
   *
   * @returns Object
   */
  function createObjectUsingCadesPlugin(name) {
    //var cadesobject = document.getElementById('cadesplugin');
    try {
      var obj = null;
      if (cadesplugin.CreateObjectAsync) {
        obj = cadesplugin.CreateObjectAsync(name);
      } else {
        isCadesPluginAssync = false;
        obj = cadesplugin.CreateObject(name);
      }
      return obj;
    } catch (e) {
      Ext.MessageBox.alert('Ошибка КриптоПро', install_message);
      return false;
    }
  }

  /**
   *
   * Создание объектов
   *
   * @param name
   * @returns {*}
   * @constructor
   *
   * @todo: need refactoring
   */
  function ObjCreator(name) {
    switch (navigator.appName) {
      case 'Microsoft Internet Explorer':
        isCadesPluginAssync = false;
        try {
          var obj = new ActiveXObject(name);
        } catch  (e) {
          Ext.MessageBox.alert('Ошибка КриптоПро', install_message);
          Debug.log('Crypto plugin error: cant load activeX');
          Debug.log(e);
          return false
        }
        return obj;
      default:
        var userAgent = navigator.userAgent;
        if (userAgent.match(/Trident\/./i)) { // IE10, 11
          try {
            var obj = new ActiveXObject(name);
          } catch  (e) {
            Ext.MessageBox.alert('Ошибка КриптоПро',install_message);
            return false
          }
          return obj;
        }
        if(userAgent.match(/ipod/i) ||userAgent.match(/ipad/i) || userAgent.match(/iphone/i)) {
          return call_ru_cryptopro_npcades_10_native_bridge("CreateObject", [name]);
        }

        // Для остальных браузеров (Chrome, Mozilla, Opera):
        return createObjectUsingCadesPlugin(name);
      }
  };

  /**
   *
   * Возвращает инфу из сертификата
   *
   * @param cert
   * @returns {*}
   */
  function getCertInfo(cert) {
    // В зависимости от типа плагина получаем информацию о сертификате.
    if (isCadesPluginAssync) {
      var subject = cert;
    } else {
      var subject = cert.SubjectName;
    }
    var subject_array = subject.split(', ');
    var info = {};
    if (!Ext.isEmpty(subject_array)) {
      Ext.each(subject_array, function (val) {
        var pair = val.split('=');
        info[pair[0]] = pair[1];
      });
    }
    return info;
  }

  function decimalToHexString(number) {
    if (number < 0) {
      number = 0xFFFFFFFF + number + 1;
    }
    return number.toString(16).toUpperCase();
  }

  function GetErrorMessage(e) {
    if (!e.message) {
      err = Base64._utf8_decode(e);
    } else if (e.number) {
      err = e.message;
    }
    return err;
  }

  function getErrorCodeFromMessage(message) {

    var code = message.match(/(\(0x\w+\))/);
    if (!Ext.isEmpty(code[0])) {
      return parseInt(code[0].substr(1,code[0].length-2),16);
    }

  }

  function showErrorMessageBox(e) {
    var code = 0;
    if (!Ext.isEmpty(e.number)) {
      code = 0xFFFFFFFF + e.number + 1; // IE
    } else {
      code = getErrorCodeFromMessage(!Ext.isEmpty(e.message)? e.message : e);
    }

    message_text = 'Ошибка подписания: ' + (!Ext.isEmpty(SIGN_ERRORS[code])?SIGN_ERRORS[code]:GetErrorMessage(e));

    Main.eds.thumbprint = null;

    var messageBox = Ext.Msg.show({
      title: 'Ошибка подписания',
      msg: message_text,
      buttons: Ext.Msg.OK,
      icon: Ext.MessageBox.ERROR,
      width: 500,
      modal: true
    });

    return true;
  }

  /**
   *
   * Проверяет готовность плагина к работе
   *
   * @param show_messages
   */
  function checkPluginReady(show_messages) {
    var isPluginLoaded = false;
    var isPluginEnabled = false;
    var isPluginWorked = false;
    var isActualVersion = false;
    try {
      var oAbout = ObjCreator("CAdESCOM.About");
      if (oAbout === false) {
        return false;
      }
      isPluginLoaded = true;
      isPluginEnabled = true;
      isPluginWorked = true;
      // проверяем версию плагина, если oAbout - promise, значит плагин 2 версии
      // если нет, то плагин версии 1.*, проверяем номер версии
      if (typeof oAbout.then === 'function') {
        isCadesPluginAssync = true;
        isActualVersion = true;
      } else if ("1.5.1500" <= oAbout.Version) {
        isActualVersion = true;
        isCadesPluginAssync = false;
      }
    }
    catch (err) {
      // Объект создать не удалось, проверим, установлен ли
      // вообще плагин. Такая возможность есть не во всех браузерах
      var mimetype = navigator.mimeTypes["application/x-cades"];
      if (mimetype) {
        isPluginLoaded = true;
        var plugin = mimetype.enabledPlugin;
        if (plugin) {
          isPluginEnabled = true;
        }
      }
    }

      if (isPluginWorked) { // плагин работает, объекты создаются
        if (isActualVersion) {
          return true;
        }
        else {
          if (show_messages) {
            Ext.MessageBox.alert('Ошибка', "Для корректной работы подписания требуется более свежая версия КриптоПро browser plugin ");
          }
          return false;
        }
      }
      else { // плагин не работает, объекты не создаются
        if (isPluginLoaded) { // плагин загружен
          if (!isPluginEnabled) { // плагин загружен, но отключен
            if (show_messages) {
              Ext.MessageBox.alert('Ошибка', "Плагин подписания загружен, но отключен в настройках браузера");
            }
            return false;
          }
          else { // плагин загружен и включен, но объекты не создаются
            if (show_messages) {
              Ext.MessageBox.alert('Ошибка', "Плагин загружен, но не удается создать объекты. Проверьте настройки браузера");
            }
            return false;
          }
        }
        else { // плагин не загружен
          if (show_messages) {
            Ext.MessageBox.alert('Ошибка КриптоПро', install_message);
          }
          return false;
        }
      }
  }

  /**
   * Собирает информацию о сертификате из промиса сертификата
   *
   * @param Promise cert Сертификат.
   *
   * @returns Promise c массивом информации.
   */
  function buildCertInfoAssync (cert) {
    var certInfo, validFrom, validTo, thumbPrint;
    var subjPromise = cert.SubjectName.then(function (subject) {
      certInfo = getCertInfo(subject);
    });
    var validFromPromise = cert.ValidFromDate.then(function (_validFrom) {
      validFrom = _validFrom;
    });
    var validToPromise = cert.ValidToDate.then(function (_validTo) {
      validTo = _validTo;
    });
    var thumbPrintPromise = cert.Thumbprint.then(function (_thumbprint){
      thumbPrint = _thumbprint;
    });
    return Promise.all([subjPromise, validFromPromise, validToPromise, thumbPrintPromise]).then(function () {
      return [thumbPrint, certInfo['CN'], validFrom, validTo, certInfo];
    });
  }

  /**
   *
   * Диалог выбора сертификата
   *
   * params.success - калбек успешного выбора
   * params.failure - калбек при отмене, ошибке
   *
   * @param params
   * @returns {boolean}
   */
  function selectCertificateForm(params) {
    if (!checkPluginReady(true)) {
      return false;
    }

    if (isCadesPluginAssync) {
      selectCertificateFormAssync(params);
      return;
    }

    if (!Ext.isEmpty(Main.eds.thumbprint)) {
      var certificate = getCertificateByThumbprint(Main.eds.thumbprint);
      if (certificate) {
        params.success({certificate: certificate});
        return true;
      } else {
        params.failure();
        return false;
      }
    }

    var certificatesStore = new Ext.data.ArrayStore({
      fields: [
        { name: 'thumb'},
        { name: 'title'},
        { name: 'validFrom', type: 'date'},
        { name: 'validTo',   type: 'date'},
        { name: 'data'}
      ]
    });

    var oStore = ObjCreator("CAPICOM.store");
    if (!oStore) {
      return false;
    }

    try {
      oStore.Open();
    }
    catch (e) {
      Ext.MessageBox.alert('Ошибка', "Ошибка при открытии хранилища: " + GetErrorMessage(e));
      Debug.log('Crypto plugin error: cant open store');
      Debug.log(e);
      return false;
    }
    var сertsArray = [];
    var certsExists = true;
    try {
      var certCnt = oStore.Certificates.Count;
    } catch (e) {
      certsExists = false;
    }

    if (!certCnt || !certsExists) {
      Ext.MessageBox.alert('Ошибка', "К сожалению, на Вашем компьютере отсутсвуют установленные сертификаты.<br/>Выполните соответствующую установку перед использованием функций подписания");
      Debug.log('Crypto plugin error: no certificates');
      return false;
    }

    for (var i = 1; i <= certCnt; i++) {
      var cert;
      try {
        cert = oStore.Certificates.Item(i);
      }
      catch (e) {
        Ext.MessageBox.alert('Ошибка', "Ошибка при перечислении сертификатов: " + GetErrorMessage(e));
        Debug.log('Crypto plugin error: cant get certificates list');
        Debug.log(e);
        return false;
      }

      // для IE
      var valid_from = new Date();
      valid_from.setTime(Date.parse(cert.ValidFromDate));

      var valid_till = new Date();
      valid_till.setTime(Date.parse(cert.ValidToDate));

      var cert_info = getCertInfo(cert);
      сertsArray.push([cert.Thumbprint, cert_info['CN'], valid_from, valid_till, cert_info]);
    }

    certificatesStore.loadData(сertsArray);
    oStore.Close();

    extSelectCertificateWindow(certificatesStore, params);

  }


  /**
   * Диалог выбора сертификата (асинхронная версия)
   *
   * params.success - калбек успешного выбора
   * params.failure - калбек при отмене, ошибке
   *
   * @param params
   * @returns {boolean}
   */
  function selectCertificateFormAssync (params) {
    if (!checkPluginReady(true)){
      return false;
    }
    if (!Ext.isEmpty(Main.eds.thumbprint)) {
      var certificate = getCertificateByThumbprint(Main.eds.thumbprint);
      if (certificate) {
        params.success({certificate: certificate});
        return true;
      } else {
        params.failure();
        return false;
      }
    }

    var oStore = ObjCreator("CAPICOM.store");
    if (!oStore) {
      return false;
    }

    var certificatesStore = new Ext.data.ArrayStore({
        fields: [
          { name: 'thumb'},
          { name: 'title'},
          { name: 'validFrom', type: 'date'},
          { name: 'validTo',   type: 'date'},
          { name: 'data'}
        ]
      });

    try {
      var openCertificates;
      var certificates;

      oStore.then(
          function (result) {
            openCertificates = result.Open(CAPICOM_CURRENT_USER_STORE, CAPICOM_MY_STORE,
                CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);
            return result.Certificates;
          }, function(err) {
            Ext.MessageBox.alert('Ошибка', "Операция отменена пользователем");
          }).then(function (_certificates) {
              certificates = _certificates;
              return certificates.Count;
          }).then(function (certsCount) {
              var certsPromises = [];
              var certsInfoArrays = [];
              for(var i=1; i<=certsCount; i++) {
                var certPromise = certificates.Item(i).then(buildCertInfoAssync);
                certPromise.then(function (certInfoArray){
                  certsInfoArrays.push(certInfoArray)
                });
                certsPromises.push(certPromise);
              }
              Promise.all(certsPromises).then(function () {
                certificatesStore.loadData(certsInfoArrays);
                extSelectCertificateWindow(certificatesStore, params);
              });
          });

    } catch (e) {
      Ext.MessageBox.alert('Ошибка', "Ошибка при открытии хранилища: " + GetErrorMessage(e));
      Debug.log('Crypto plugin error: cant open store');
      Debug.log(e);
      return false;
    }

  }

  /**
   * Создает окно выбора сертификата
   *
   * @param certificatesStore объект хранилища для вывода в окне
   * @param params параметры переданные из внешнего вызова функции signMessage
   */
  function extSelectCertificateWindow (certificatesStore, params) {
    var certgrid_id = Ext.id();
    var checkbox_id = Ext.id();
    var window_id = Ext.id();

    new Ext.Window({
      title: 'Выбор сертификата для подписания',
      height: 200,
      width: 400,
      modal: true,
      layout: 'fit',
      id: window_id,
      items: [
        {
          xtype: 'grid',
          border: false,
          id: certgrid_id,
          viewConfig: {
            forceFit: true
          },
          columns: [
            {header: 'Владелец', dataIndex: 'title', width: 150},
            {header: 'Действует с', xtype: 'datecolumn',   format:'d.m.Y', dataIndex: 'validFrom', flex: 2},
            {header: 'Действует по', xtype: 'datecolumn',   format:'d.m.Y', dataIndex: 'validTo', flex: 2},
            {header: 'Доп.', xtype: 'actioncolumn', flex: 1, width: 30,  items: [
              {
                iconCls: 'x-action-icon',
                icon: '/ico/about.png',
                tooltip: 'Информация об ЭП',
                handler: function(grid, rowIndex) {
                  var certificate = grid.getStore().getAt(rowIndex);
                  var message = '';
                  if (!Ext.isEmpty(certificate.data.data)) {
                    for (var key in certificate.data.data) {
                      if (DN_FIELDS_DESCRIPTION[key]!=undefined) {
                        message+='<b>'+DN_FIELDS_DESCRIPTION[key]+':</b> '+certificate.data.data[key]+'<br/>';
                      }
                    }
                  }

                  if (!Ext.isEmpty(message)) {
                    Ext.MessageBox.alert('Информация об ЭП', message);
                  }

                }
              }
            ]
            }

          ],
          store: certificatesStore
        }
        ],
      bbar: {toolbarCls: 'x-panel-fbar',
        cls:'bar-butons-ecp',
        items: [{ xtype: 'checkbox', boxLabel: 'запомнить выбор', flex: 1, checked: true, id: checkbox_id, inputValue: 1},
        '->',
        {
          xtype: 'button',
          ctCls: 'btn-text-ecp',
          text: 'Выбрать',
          handler: function() {
            var grid = Ext.getCmp(certgrid_id);
            var grid_selection = grid.getSelectionModel().getSelections();
            if (grid_selection.length!=1) {
              return false;
            }

            var thumbprint = grid_selection[0].get('thumb');
            if(isCadesPluginAssync){
              oCert = getCertificateByThumbprintAssync(thumbprint);
            } else {
              oCert = getCertificateByThumbprint(thumbprint);
              try {
                if (!oCert || !oCert.PrivateKey) {
                  Ext.getCmp(window_id).close();
                  params.failure();
                  return false;
                }
              } catch(e) {
                showErrorMessageBox(e);
                return false;
              }
            }


            var skip_checkbox = Ext.getCmp(checkbox_id);
            if (true == skip_checkbox.checked) {
              Main.eds.thumbprint = thumbprint;
            }
            Ext.getCmp(window_id).close();
              params.success({certificate: oCert});
              return true;
            }
          },{
          xtype: 'button',
          text: 'Отмена',
          handler: function () {
            Ext.getCmp(window_id).close();
            params.failure();
          }
      }]}
    }).show();
  }

  /**
   *
   * Подпись сообщения
   *
   * params.message - сообщение
   * params.success - калбек успешного подписания
   * params.failure - калбек ошибки
   *
   * @param params
   * @returns {boolean}
   */
  function signMessage(params) {
    if (Main.signaturePluginByDefault) {
      var popup = new Application.components.PluginSelector();
      popup.show();
      return false;
    }

    if (!Ext.isFunction(params.success)) {
      params.success = function() {};
    }

    if (!Ext.isFunction(params.failure)) {
      params.failure = function() {};
    }

    if (!Ext.isEmpty(Main.eds.thumbprint)) { // уже выбран сертификат
      oCert = getCertificateByThumbprint(Main.eds.thumbprint);
      return signAndCheckSignedData(oCert, params);
    }

    // форма
    selectCertificateForm({
      allowSkip: params.allowSkip!=undefined ? params.allowSkip : true,
      success: function (response) {
          oCert = response.certificate;
          return signAndCheckSignedData(oCert, params);
      },
      failure: function () {
        params.failure();
      }
    });
  }

    /**
     * Проверяет, что сообщение успешно подписалось, и если подписалось
     * то вызывает дальше функцию, которая проверит само сообщение.
     *
     * @param {object} oCert Объект сертификата.
     * @param {object} params Внешние параметры.
     *
     * @returns {boolean} true в случае успеха, false - неудачи.
     */
    function signAndCheckSignedData(oCert, params) {
        var sSignedData = signByCertificate(oCert, params.message);
        if (sSignedData != false) {
            return checkSignedMessage(sSignedData, params);
        } else {
            return false;
        }
    }

  /**
   * Проверяет подписанное сообщение и вызывает коллбеки из внешнего вызова функции signMessage.
   *
   * @param string sSignedData подписанное сообщение.
   * @param params параметры переданные из внешнего вызова функции signMessage.
   *
   * @returns {boolean} результат проверки.
   */
  function checkSignedMessage(sSignedData, params) {
    if (isCadesPluginAssync) {
      checkSignedMessageAssync(sSignedData, params);
      return;
    }
    if (!Ext.isEmpty(sSignedData)) {
      params.success({message_signed: sSignedData, certificate: oCert});
      return true;
    }
    Main.eds.thumbprint = null; // не сохраняем ошибочный серт в кеше
    params.failure({certificate: oCert});
    return false;
  }

  /**
   * Проверяет подписанное сообщение и вызывает коллбеки из внешнего вызова функции signMessage.
   * (Ассинхронная версия).
   *
   * @param string sSignedData подписанное сообщение.
   * @param params параметры переданные из внешнего вызова функции signMessage.
   *
   * @returns {boolean} результат проверки.
   */
  function checkSignedMessageAssync(sSignedData, params) {
    sSignedData.then(function (signedData) {
      if (!Ext.isEmpty(signedData)) {
        params.success({message_signed: signedData, certificate: oCert});
      } else {
        Main.eds.thumbprint = null; // не сохраняем ошибочный серт в кеше
        params.failure({certificate: oCert});
      }
    });
  }

  /**
   *
   * Возвращает сертификат по отпечатку
   *
   * @param thumbprint
   * @returns {*}
   */
  function getCertificateByThumbprint(thumbprint) {
    if (isCadesPluginAssync) {
      return getCertificateByThumbprintAssync(thumbprint);
    }
    try {
      var oStore = ObjCreator("CAPICOM.store");
      oStore.Open();
    } catch (e) {
      Ext.MessageBox.alert('Ошибка', "Ошибка при открытии хранилища: " + GetErrorMessage(e));
      Debug.log('Crypto plugin error: cant open store');
      Debug.log(e);
      return;
    }
    var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
    var oCerts = oStore.Certificates.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint);
    if (oCerts.Count == 0) {
      Ext.MessageBox.alert('Ошибка', "Выбраный сертификат не доступен");
      Debug.log('Crypto plugin error: cant load certificate');
      //Debug.log(e);
      return false;
    }
    return oCerts.Item(1);
  }

  /**
   * Возвращает сертификат по отпечатку (Ассинхронная версия).
   *
   * @param thumbprint отпечаток сертификата
   *
   * @returns Promise промис сертификата
   */
  function getCertificateByThumbprintAssync(thumbprint) {
    try {
      var oStore = ObjCreator("CAPICOM.store");
    } catch (e) {
      Ext.MessageBox.alert('Ошибка', "Ошибка при открытии хранилища: " + GetErrorMessage(e));
      Debug.log('Crypto plugin error: cant open store');
      Debug.log(e);
      return;
    }
    return oStore.then(function (store) {
      openCertificates = store.Open();
      return store.Certificates;
    }).then(function (certificates) {
      var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
      return certificates.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint);
    }).then(function (certificate) {
      var foundIndex = 1;
      return certificate.Item(foundIndex);
    });
  }

  /**
   *
   * Подпись сообщения выбранным сертификатом
   *
   * @param cert
   * @param message
   * @returns {*}
   */
  function signByCertificate(cert,message, verify) {
    if (isCadesPluginAssync) {
      return signByCertificateAssync(cert, message, verify);
    }
    try {
      var oSigner = ObjCreator("CAdESCOM.CPSigner");
    } catch (e) {
      Ext.MessageBox.alert('Ошибка', 'Ошибка при при создании объекта CAdESCOM.CPSigner!<br/>Возможно КриптоПро ЭЦП Browser plug-in не установлен или работает некорректно (<a href="http://www.cryptopro.ru/products/cades/plugin/get">Установить</a>)');
      Debug.log('Crypto plugin error: cant create CAdESCOM.CPSigner');
      Debug.log(e);
      return;
    }
    if (oSigner) {
      oSigner.Certificate = cert;
    }
    else {
      Ext.MessageBox.alert('Ошибка', 'Ошибка при при создании объекта CAdESCOM.CPSigner!<br/>Возможно КриптоПро ЭЦП Browser plug-in не установлен или работает некорректно (<a href="http://www.cryptopro.ru/products/cades/plugin/get">Установить</a>)');
      Debug.log('Crypto plugin error: cant create CAdESCOM.CPSigner');
      //Debug.log(e);
      return;
    }

    var oSignedData = ObjCreator("CAdESCOM.CadesSignedData");

    oSignedData.ContentEncoding = CADESCOM_BASE64_TO_BINARY;
    oSignedData.Content         = Base64.encode(message);
    oSigner.Options             = 1;
    // @TODO: здесь еще можно добавлять временные метки
    try {
      var sSignedData = oSignedData.SignCades(oSigner, CADESCOM_CADES_BES);
    } catch (e) {
      showErrorMessageBox(e);
      return false;
    }

    // @TODO: Разобраться, что делает эта проверка, и почему сейчас не используется
    if (true==verify) { // не работает проверка
      var is_verified = verifySigned(sSignedData);
      if (is_verified) {
        return sSignedData;
      }
    }
    return sSignedData;
  }

  /**
   * Подпись сообщения выбранным сертификатом (Асинхронная версия).
   *
   * @param cert Промис сертификата.
   * @param message сообщение для подписи
   * @returns {*}
   */
  function signByCertificateAssync(cert, message) {
    var oSigner;
    var oCert;
    var oSignedData;
    try {
      var oSignerPromise = ObjCreator("CAdESCOM.CPSigner");
    } catch (e) {
      Ext.MessageBox.alert('Ошибка', 'Ошибка при при создании объекта CAdESCOM.CPSigner!<br/>Возможно КриптоПро ЭЦП Browser plug-in не установлен или работает некорректно (<a href="http://www.cryptopro.ru/products/cades/plugin/get">Установить</a>)');
      Debug.log('Crypto plugin error: cant create CAdESCOM.CPSigner');
      Debug.log(e);
      return;
    }

    var oSignedDataPromise = ObjCreator("CAdESCOM.CadesSignedData");

    // @TODO: здесь еще можно добавлять временные метки

    // Устанавливаем сертификат, и настраиваем параметры нужные
    // для правильного подписывания документов на площадке.
    // Затем подписываем сообщение
    return oSignerPromise.then(function (_oSigner) {
      oSigner = _oSigner;
      return cert;
    }).then(function (_oCert) {
      oCert = _oCert;
      return oSigner.propset_Certificate(oCert);
    }).then(function () {
      return oSigner.propset_Options(CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN);
    }).then(function () {
      return oSignedDataPromise;
    }).then(function (oSignedDataRes) {
      oSignedData = oSignedDataRes;
      return oSignedData.propset_ContentEncoding(CADESCOM_BASE64_TO_BINARY);
    }).then(function () {
      return oSignedData;
    }).then(function () {
      return oSignedData.propset_Content(Base64.encode(message));
    }).then(function () {
      return oSignedData;
    }).then(function (oSignedData) {
      var sSignedData = oSignedData.SignCades(oSigner, CADESCOM_CADES_BES);
      return sSignedData;
    });
  }

  /**
   *
   * Проверка подписанного сообщения
   *
   * @param sSignedMessage
   * @returns {boolean}
   */
  function verifySigned(sSignedMessage) {
    var oSignedData = ObjCreator("CAdESCOM.CadesSignedData");
    try {
      var ver = oSignedData.VerifyCades(sSignedMessage, CADESCOM_CADES_BES);
    } catch (e) {
      Ext.MessageBox.alert('Ошибка',"Ошибка проверки подписания. Подробно: " + GetErrorMessage(e));
      Debug.log('Crypto plugin error: cant check signature');
      Debug.log(e);
      return false;
    }

    return true;
  }

  var Base64 = {_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (input) {
    var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
    input = Base64._utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64
      } else if (isNaN(chr3))enc4 = 64;
      output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4)
    }
    ;
    return output
  }, decode: function (input) {
    var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64)output = output + String.fromCharCode(chr2);
      if (enc4 != 64)output = output + String.fromCharCode(chr3)
    }
    ;
    return Base64._collapseBytes(output)
  }, _collapseBytes: function (str) {
    var output = "", l = str.length, i, chr1, chr2, chr3;
    for (i = 0; i < l; i += 2)if (i + 1 < l) {
      chr1 = str.charCodeAt(i);
      chr2 = str.charCodeAt(i + 1);
      chr3 = String.fromCharCode(chr1 + (chr2 << 8));
      output += chr3
    } else {
      chr1 = str.charCodeAt(i);
      output += String.fromCharCode(chr1)
    }
    ;
    return output
  }, _utf8_encode: function (string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c)
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128)
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128)
      }
    }
    ;
    return utftext
  }, _utf8_decode: function (utftext) {
    var string = "", i = 0, c = c1 = c2 = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++
      } else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3
      }
    }
    ;
    return string
  }};

  function utf8_encode(string) {
    string = string.replace(/rn/g,"n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }

    return utftext;
  }

  CryptoPlugin.signMessage = signMessage;
  CryptoPlugin.selectCertificateForm = selectCertificateForm;
  CryptoPlugin.getCertInfo = getCertInfo;
  CryptoPlugin.signByCertificate = signByCertificate;
  CryptoPlugin.DN_FIELDS_DESCRIPTION = DN_FIELDS_DESCRIPTION;
  window.CryptoPlugin = CryptoPlugin;

  (function(){
    for (var i in CryptoPlugin) {
      if (CryptoPlugin.hasOwnProperty(i)) {
        window[i] = CryptoPlugin[i];
      }
    }
  })();

};