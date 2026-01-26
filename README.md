# 3D Obby Playable

**демо**

1. Приложил готовые playable билды в папку demo/
1. single-file-3x.html - можно просто запустить в браузере
1. Unity.html - билд для Unity Ads. Заливал в Unity Ads и проверял через https://play.google.com/store/apps/details?id=com.unity3d.auicreativetestapp

**Генерация playable**

1. В кокосе из коробки нет билда именно под playable, но нашел подходящий готовый билдер https://github.com/ppgee/cocos-pnp
1. Сборка playable меню окна Cocos Creator -> Extension -> playable-adapter -> build. Собирается web-mobile билд, учитывается конфиг web-mobile билда, так что там выставляем настройки, но запускаем билд через extension
1. ВНИМАНИЕ!!! Во время сборки playable билда нужно отключить MD5 Cache, иначе будут ошибки по типу
```
Google.html:121 SyntaxError: "undefined" is not valid JSON at JSON.parse (<anonymous>) at __adapter_get_imports (Google.html:121:11388842) at window.__adapter_init (Google.html:121:11393758) at __adapter_success (Google.html:121:11395067) at __adapter_exec_js (Google.html:121:11394752) at __adapter_unzip (Google.html:121:11394468) at Google.html:121:11395096 at Google.html:121:11395134
```
1. ВНИМАНИЕ!!! В конфиге билда web-mobile нужно выставить Bundle Mode Of Native Code = Asmjs, иначе возможен черный экран при проигрывании плейбла уже на площадках. Выставить Asmjs нужно когда используем физический движок bullet. Issue здесь: https://github.com/ppgee/cocos-pnp/issues/33, решение тут: https://forum.cocos.org/t/topic/163934
1. В общем, стоит заглядывать в issues в случае проблем: https://github.com/ppgee/cocos-pnp/issues
1. ВНИМАНИЕ!!! Насколько вижу все ресурсы в том числе даже код inline закодированы в итоговом файле. Из-за этого валидаторы площадок могут не увидеть реальный необходимый код, например Unity Ads искал mraid.open('ссылка на приложение') и не нашел. В искодниках код есть и мы его выполним, просто код закодирован и валидатору не видно. Временный быстрый хак просто добавить в сгенерированный Unity.html что-то типо <script>function showMyAd(){mraid.open('ссылка на приложение')}</script> чтобы обойти автоматический непропускающий валидатор
1. Так же еще можно ознакомиться с конфигами билда через .adapterrc: https://github.com/ppgee/cocos-pnp?tab=readme-ov-file#extend-features

**Сторонние библиотеки**

1. [EasyController](https://store.cocos.com/app/en/detail/4207): - логика управления персонажем + интерфейсы для тач джойстика
1. [cocos-pnp](https://github.com/ppgee/cocos-pnp): - сборка playable ad билда
1. ~~[playable-build-tool](https://github.com/minzhi3/playable-build-tool): - сборка playable ad билда. Этот плагин не сработал, были ошибки~~

**Feature Cropping**

1. Например у UnityAds требование inline файл билд не больше 5Мб: https://docs.unity.com/en-us/grow/acquire/creatives/playable/specifications
1. Убрал HDR скайбоксы ~1-2 Мб. Убрал лишние фичи.
1. Анимации оставил. Сжал текстуры методами кокоса.
1. Ещё ~1.5 Мб можно убрать перейдя с физики bullet на cannon

**Physics Engine**

https://docs.cocos.com/creator/3.8/manual/en/physics/character-controller/
https://docs.cocos.com/creator/3.8/manual/en/physics/physics-engine.html

В приоритете легковесный движок

1. Cannon.js (141Kb) - легковесный, но он не поддерживает CapsuleCharacterController, BoxCharacterController, CapsuleCollider которые часто используются для персонажей. Если потребуется ещё срезать вес и переходить на cannon, то нужно управление персонажей переделывать под BoxCollider
1. **Bullet (1.5Mb) - тяжелее, но работает с CharacterController и CapsuleCollider и сейчас выбран он**
1. PhysX - самый точный, но и самый тяжелый. Точно пока не находил файл и не мерял, но с PhysX playable билд на момент проверки весил на 6 Мб больше чем c bullet (13 Мб против 6 Мб)
