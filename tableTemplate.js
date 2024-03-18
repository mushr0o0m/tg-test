const generateTableHtml = (data) => {
  let tableRows = '';
  data.forEach(player => {
    tableRows +=
      `<tr>
        <td>${player.nickname}</td>
        <td>${player.email}</td>
        <td>${player.registered_date}</td>
        <td>${player.status}</td>
      </tr>`;
  });

  return `
  <!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Players</title>
</head>
<body>
    <h1>Список игроков</h1>
        <table>
          <tr>
            <th>Ник</th>
            <th>Email</th>
            <th>Зарегистрирован</th>
            <th>Статус</th>
          </tr>
          ${tableRows}
        </table>
</body>
</html>
  `
}

module.exports = generateTableHtml;