<!DOCTYPE html>
<html lang="ja">

<head>
  <?php include($_SERVER['DOCUMENT_ROOT'] . "/template/head.html"); ?>
  <title>Pages</title>
</head>

<body>
  <?php include($_SERVER['DOCUMENT_ROOT'] . "/template/header.html"); ?>

  <div id="content-wrapper">
    <div id="content">

      <h1>Pages</h1>

      <h2>東方関連</h2>
      <ul>
        <li><a href="./touhou/clear_table.php">クリア機体表</a></li>
        <li><a href="./touhou/fanbooks_i_have.php">紙媒体で所有する・かつ既読の東方同人誌</a></li>
        <li><a href="./touhou/gensou_no_yukue.php">『幻想の行方』解説</a></li>
      </ul>

      <h2>プログラミング関連</h2>
      <ul>
        <li><a href="./programming/license.php">OSSライセンスあれこれ</a></li>
        <li><a href="./programming/latex-book-template.php">LaTeX 技術系同人誌用テンプレート</a></li>
      </ul>

      <h2>その他</h2>
      <ul>
        <li><a href="./miscellaneous/calendar.php">予定表</a></li>
      </ul>

    </div>
  </div>
  
  <?php include($_SERVER['DOCUMENT_ROOT'] . "/template/footer.html"); ?>
</body>

</html>
