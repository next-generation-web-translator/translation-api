# 细节处理

## 如何查句典

1. 查阅资料：URI、paths、原文、字数、词数、语法加权值
1. URI 相同、原文相同的，直接给出结果
1. URI 相同、

## 如何根据英文进行模糊查阅

1. 用 NLP API 把句子拆成各个成分
1. 为成分中的各个要素设置不同的权重（将来可用 ML 模型进行改进）
1. 根据成分*权重的值，得出一个大数字
1. 在数据库中使用这个大数字进行范围查阅，快速得出结果
