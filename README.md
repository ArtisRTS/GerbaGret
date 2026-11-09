# Тихий гербарий

Небольшая браузерная игра: прогулка по осеннему лесу и пять листьев для гербария.

Управление: WASD, стрелки или щелчок по тропинке. Рядом с листом нажмите E или кнопку подбора. На сенсорном экране используйте касания. Кнопка «Найти листочек» показывает маршрут. Гербарий автоматически сохраняется в localStorage этого браузера.

## Запуск

Готовая игра находится в `dist/`. Выполните `node serve.cjs`, откройте http://127.0.0.1:5173. Для пересборки установите зависимости через `npm install`, затем `npm run build`. Phaser 3.90.0 включён в assets и не требует CDN. Шрифты Google Fonts имеют системные замены.

## Первая версия

Phaser 3 + TypeScript. Иллюстрированная карта и атлас листьев созданы встроенным генератором изображений. Девочка анимируется средствами Canvas. Музыка и лесные звуки синтезируются Web Audio: это атмосферный эскиз, который можно заменить записанной музыкой и полевыми звуками. Звук запускается только после действия игрока. Регистрация и сервер для сохранений не нужны.

Карта — одна плоская иллюстрация с навигацией по дорожкам; полноценное перекрытие персонажа отдельными деревьями оставлено для следующей версии. Сгенерированные изображения листьев служат художественными иллюстрациями, не определителем растений.

## Промпты изображений

Лес: richly detailed hand-painted storybook autumn forest, high oblique top-down 2.5D perspective, no sky, connected wide ochre paths with left and right branches, birch oak maple linden trees, sage green and honey gold, pond lower right, bench upper left, fine ink outlines, no text or people.

Листья: five equal columns on transparent background, photorealistic autumn leaves left to right: Quercus robur, Acer platanoides, Betula pendula, Tilia cordata, Populus tremula; accurate botanical shapes and fine veins, stems down, no text.
