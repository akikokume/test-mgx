# Smart Reminder ToDo システム設計

## 実装アプローチ

科学的学習理論に基づいたリマインダー機能と学習サポート機能を持つToDoアプリを実装するために、以下のアプローチを採用します：

### 技術的難点と解決策

1. **忘却曲線アルゴリズムの実装**
   - エビングハウスの忘却曲線とSuperMemo SM-2アルゴリズムを実装し、個人の学習パターンに合わせて調整する必要があります。
   - **解決策**: オープンソースのSM-2アルゴリズム実装を活用し、ユーザーの理解度評価（0-5）に基づいて次回学習タイミングを計算します。

2. **リアルタイム通知システムの構築**
   - 複数のデバイスで同期し、適切なタイミングで通知を送る必要があります。
   - **解決策**: FirebaseのCloud MessagingとFirestoreを使用してリアルタイムデータ同期と通知を実現します。

3. **ユーザー体験の最適化**
   - 学習タスクと通常タスクを統合しながらも、明確に区別する必要があります。
   - **解決策**: タスクタイプに応じたUIデザインと、効率的なタブナビゲーションを実装します。

### 選定フレームワーク・ライブラリ

1. **フロントエンド**
   - React + Tailwind CSS: UI構築の効率化とレスポンシブデザインの実現
   - React Query: サーバーデータの効率的な取得・キャッシュ管理
   - Redux Toolkit: 状態管理の簡素化
   - React Hook Form: フォーム管理の効率化

2. **バックエンド**
   - Node.js + Express: スケーラブルなAPIサーバー
   - MongoDB: 柔軟なデータモデル
   - Mongoose: MongoDB ORM
   - Bull.js: タスクスケジューリングとバックグラウンドジョブ処理

3. **インフラ・サービス**
   - Firebase Authentication: ユーザー認証
   - Firebase Cloud Messaging: プッシュ通知
   - MongoDB Atlas: データベースホスティング
   - AWS S3/GCS: ファイルストレージ（画像・音声添付用）

## データ構造とインターフェース

アプリケーションのコアとなるデータモデルとクラス設計は別ファイル「smart_reminder_todo_class_diagram.mermaid」に詳細を記述しています。

## プログラム呼び出しフロー

アプリケーションの主要な操作フローは別ファイル「smart_reminder_todo_sequence_diagram.mermaid」に詳細を記述しています。

## システムアーキテクチャの概要

Smart Reminder ToDoアプリは、クライアントサーバーモデルに基づいたウェブアプリケーションとして実装します。全体的なシステムアーキテクチャは以下の通りです：

### 1. 全体アーキテクチャ

```
┌─────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│  クライアント層  │     │   アプリケーション層  │     │   データベース層   │
│  (Frontend)     │────▶│    (Backend)      │────▶│   (Persistence)  │
└─────────────────┘     └───────────────────┘     └──────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│  React SPA      │     │  RESTful API      │     │  MongoDB         │
│  React Router   │     │  Express.js       │     │  MongoDB Atlas   │
│  Redux          │     │  Node.js          │     │                  │
└─────────────────┘     └───────────────────┘     └──────────────────┘
        │                        │                        
        │                        │                        
        ▼                        ▼                        
┌─────────────────┐     ┌───────────────────┐     
│  Tailwind CSS   │     │  Firebase Auth    │     
│  React Query    │     │  Firebase FCM     │     
│  React Hook Form│     │  Bull.js          │     
└─────────────────┘     └───────────────────┘     
```

### 2. マイクロサービス構成

- **認証サービス**: ユーザー登録、ログイン、セッション管理を担当
- **タスク管理サービス**: タスクのCRUD操作を担当
- **学習コンテンツサービス**: 学習コンテンツの作成・管理を担当
- **スペースド・リピテーションサービス**: 学習アルゴリズムとリマインダースケジュール生成を担当
- **通知サービス**: プッシュ通知やメール通知の送信を担当

## 学習曲線アルゴリズムの実装方法

### SuperMemo SM-2アルゴリズムの実装

SM-2アルゴリズムは、ユーザーの理解度評価に基づいて次回の復習間隔を決定する間隔反復学習アルゴリズムです。以下のように実装します：

```javascript
class SM2Algorithm {
  // 初期値設定
  constructor() {
    this.INITIAL_EASE_FACTOR = 2.5; // 初期の容易度係数
    this.MINIMUM_EASE_FACTOR = 1.3; // 最小の容易度係数
  }

  /**
   * 次の復習間隔を計算する
   * @param {number} quality - 理解度評価 (0-5)
   * @param {number} prevInterval - 前回の間隔（日数）
   * @param {number} easeFactor - 容易度係数
   * @return {object} - 新しい間隔と容易度係数
   */
  calculateNextInterval(quality, prevInterval = 0, easeFactor = this.INITIAL_EASE_FACTOR) {
    // 0-2の評価は再学習（1日後に復習）
    if (quality < 3) {
      return { interval: 1, easeFactor };
    }
    
    // 初めての学習の場合
    if (prevInterval === 0) {
      return { interval: 1, easeFactor };
    } 
    // 2回目の正解の場合
    else if (prevInterval === 1) {
      return { interval: 6, easeFactor };
    }
    // それ以降の正解の場合
    else {
      // 新しい容易度係数を計算
      const newEaseFactor = this.calculateEaseFactor(quality, easeFactor);
      // 新しい間隔を計算
      const newInterval = Math.round(prevInterval * newEaseFactor);
      return { interval: newInterval, easeFactor: newEaseFactor };
    }
  }

  /**
   * 新しい容易度係数を計算する
   * @param {number} quality - 理解度評価 (0-5)
   * @param {number} prevEaseFactor - 前回の容易度係数
   * @return {number} - 新しい容易度係数
   */
  calculateEaseFactor(quality, prevEaseFactor) {
    let newEaseFactor = prevEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // 容易度係数の下限を設定
    if (newEaseFactor < this.MINIMUM_EASE_FACTOR) {
      newEaseFactor = this.MINIMUM_EASE_FACTOR;
    }
    
    return newEaseFactor;
  }

  /**
   * 学習記録に基づいて次回のスケジュールを生成する
   * @param {object} learningRecord - 学習記録
   * @return {Date} - 次回の学習予定日
   */
  generateNextReminder(learningRecord) {
    const { understandingLevel, previousInterval, easeFactor } = learningRecord;
    const { interval, easeFactor: newEaseFactor } = 
      this.calculateNextInterval(understandingLevel, previousInterval, easeFactor);
    
    // 次回の日付を計算
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    
    return {
      scheduledAt: nextDate,
      interval,
      easeFactor: newEaseFactor
    };
  }
}
```

## リマインダー機能の技術的実装

### 1. リマインダースケジューリングシステム

学習リマインダーは、Bull.jsを使用してジョブキューとして実装します。ユーザーの理解度評価に応じて動的にスケジュールを調整します。

```javascript
// リマインダーサービス
class ReminderService {
  constructor(redisClient) {
    // Bull.jsキューの初期化
    this.reminderQueue = new Queue('learning-reminders', { redis: redisClient });
    this.sm2Algorithm = new SM2Algorithm();
  }
  
  /**
   * 学習タスクのリマインダーをスケジュールする
   * @param {object} learningTask - 学習タスク
   * @param {object} learningRecord - 学習記録（存在すれば）
   */
  async scheduleReminder(learningTask, learningRecord = null) {
    // 学習記録がある場合はSM-2アルゴリズムで次回日時を計算
    // ない場合は初回リマインダーとして1日後に設定
    let nextReminder;
    
    if (learningRecord) {
      nextReminder = this.sm2Algorithm.generateNextReminder(learningRecord);
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      nextReminder = { scheduledAt: tomorrow, interval: 1, easeFactor: 2.5 };
    }
    
    // リマインダーをデータベースに保存
    const reminderSchedule = await ReminderSchedule.create({
      userId: learningTask.userId,
      taskId: learningTask.id,
      contentId: learningRecord ? learningRecord.contentId : null,
      scheduledAt: nextReminder.scheduledAt,
      interval: nextReminder.interval,
      easeFactor: nextReminder.easeFactor,
      isCompleted: false,
      createdAt: new Date()
    });
    
    // Bull.jsを使用してリマインダージョブをスケジュール
    const delay = nextReminder.scheduledAt.getTime() - Date.now();
    await this.reminderQueue.add(
      'send-reminder',
      {
        reminderId: reminderSchedule.id,
        userId: learningTask.userId,
        taskId: learningTask.id,
        contentId: learningRecord ? learningRecord.contentId : null
      },
      { delay }
    );
    
    return reminderSchedule;
  }
}
```

### 2. 通知配信システム

複数のデバイスに通知を配信するため、Firebase Cloud Messaging (FCM) を使用します。

```javascript
class NotificationService {
  constructor(firebaseAdmin) {
    this.firebaseAdmin = firebaseAdmin;
  }
  
  /**
   * 学習リマインダー通知を送信する
   * @param {object} reminderData - リマインダーデータ
   */
  async sendLearningReminder(reminderData) {
    const { userId, taskId, contentId, reminderId } = reminderData;
    
    // ユーザーのデバイストークンを取得
    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log('No FCM tokens found for user', userId);
      return;
    }
    
    // 関連データを取得
    const task = await LearningTask.findById(taskId);
    const content = contentId ? await LearningContent.findById(contentId) : null;
    
    // 通知メッセージを作成
    const title = '学習リマインダー';
    const message = content 
      ? `「${task.title}」の「${content.question}」を復習する時間です`
      : `「${task.title}」を学習する時間です`;
    
    // 通知用ペイロードを作成
    const payload = {
      notification: {
        title,
        body: message,
        clickAction: 'OPEN_LEARNING_SESSION'
      },
      data: {
        type: 'LEARNING_REMINDER',
        taskId,
        contentId: contentId || '',
        reminderId
      }
    };
    
    // Firebase Cloud Messagingで通知を送信
    const response = await this.firebaseAdmin.messaging().sendToDevice(
      user.fcmTokens,
      payload
    );
    
    // 通知履歴をデータベースに保存
    await LearningNotification.create({
      userId,
      taskId,
      contentId,
      reminderId,
      title,
      message,
      isRead: false,
      createdAt: new Date()
    });
    
    return response;
  }
}
```