import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // デフォルトの診療項目を作成
  const treatments = [
    {
      name: '矯正歯科',
      description: '歯並びや噛み合わせの改善',
      defaultPriorities: JSON.stringify([
        '治療期間',
        '費用・料金プラン',
        '症例数・実績',
        '使用装置（ワイヤー、マウスピース等）',
        '無料相談の有無',
        '分割払い対応',
        '担当医の経歴',
      ]),
    },
    {
      name: 'インプラント',
      description: '人工歯根による歯の再建',
      defaultPriorities: JSON.stringify([
        '成功率・実績',
        '保証制度',
        '使用メーカー',
        'CT・設備',
        '費用・料金',
        '手術の流れ',
        '担当医の専門資格',
      ]),
    },
    {
      name: '審美歯科',
      description: '見た目の美しさを追求した歯科治療',
      defaultPriorities: JSON.stringify([
        'ホワイトニング',
        'セラミック治療',
        'ラミネートベニア',
        '症例写真',
        '費用・料金',
        '治療期間',
        '自然な仕上がり',
      ]),
    },
    {
      name: '一般歯科',
      description: '虫歯治療、歯周病治療など',
      defaultPriorities: JSON.stringify([
        '痛みの少ない治療',
        '予防歯科',
        '定期検診',
        '保険診療対応',
        '急患対応',
        '丁寧な説明',
      ]),
    },
    {
      name: '小児歯科',
      description: '子どもの歯科治療',
      defaultPriorities: JSON.stringify([
        'キッズスペース',
        '怖がらない工夫',
        'フッ素塗布',
        'シーラント',
        '予防プログラム',
        '保護者への説明',
      ]),
    },
    {
      name: 'ホワイトニング',
      description: '歯を白くする施術',
      defaultPriorities: JSON.stringify([
        'オフィスホワイトニング',
        'ホームホワイトニング',
        '費用・料金',
        '効果の持続期間',
        'ビフォーアフター',
        '痛みの有無',
      ]),
    },
    {
      name: '入れ歯・義歯',
      description: '部分入れ歯、総入れ歯の作成',
      defaultPriorities: JSON.stringify([
        '保険vs自費',
        'ノンクラスプデンチャー',
        '金属床義歯',
        '調整・メンテナンス',
        '装着感',
        '費用・料金',
      ]),
    },
    {
      name: '口腔外科',
      description: '親知らず抜歯、顎関節症など',
      defaultPriorities: JSON.stringify([
        '親知らず抜歯',
        '顎関節症治療',
        '口内炎・粘膜疾患',
        '設備・機器',
        '専門医資格',
        '全身管理',
      ]),
    },
  ]

  for (const treatment of treatments) {
    await prisma.treatmentCategory.upsert({
      where: { name: treatment.name },
      update: treatment,
      create: treatment,
    })
  }

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
