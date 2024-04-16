import { defineStore } from "pinia";
import { reactive } from "vue";
import { encode } from 'plantuml-encoder';
export const useMileStoneStore = defineStore({
    id: 'mileStone',
    state: () => ({
        workingSpace: [reactive({ id: '用例图', mileStone: '' }),
        reactive({ id: '概念类图', mileStone: '' }),
        reactive({ id: '系统顺序图', mileStone: '' }),
        reactive({ id: '状态图', mileStone: '' }),
        reactive({
            id: '需求规格说明文档',
            checkpoint: {
                introduction: {
                    purpose: "",
                    scope: "",
                    definitions_acronyms_and_abbreviations: "",
                    references: "",
                    overview: "",
                },
                overall_description: {
                    product_perspective: "",
                    product_functions: "",
                    user_characteristics: "",
                    constraints: "",
                    assumptions_and_dependencies: "",
                },
                specific_requirements: {
                    external_interface_requirements: {
                        user_interfaces: "",
                        hardware_interfaces: "",
                        software_interfaces: "",
                        communications_interfaces: "",
                    },
                    functional_requirements: [
                        {
                            feature_name: "",
                            introduction_of_feature: "",
                            stimulus_response_sequence: "",
                            associated_functional_requirements: "",
                        }
                    ],
                    performance_requirements: "",
                    design_constraints: "",
                    software_system_attributes: "",
                    other_requirements: "",
                }
            }
        }),
        reactive({
            id: '用例分析文档', mileStone: []
        }),
        ],
    }),
    actions: {
        getWorkingSpace(id) {
            const item = this.workingSpace.find(c => c.id === id);
            if (item) {
                return item.mileStone;
            } else {
                console.error(`No item found with id: ${id}`);
                return null;
            }
        },
        getMilestone(id) {
            return this.mileStones.find(c => c.id === id).mileStone;
        },
        setWorkingSpace(id, MileStone) {
            if (id.includes('图')) {
                this.workingSpace.find(c => c.id === id).mileStone = MileStone;
            } else if (id === '用例分析文档') {
                const item = this.workingSpace.find(c => c.id === id);
                if (item) {
                    MileStone.forEach(newMileStone => {
                        const index = item.mileStone.findIndex(m => m.name === newMileStone.name);
                        if (index !== -1) {
                            // 如果找到相同的 name，覆盖它
                            item.mileStone[index] = newMileStone;
                        } else {
                            // 如果没有找到相同的 name，添加新的 MileStone
                            item.mileStone.push(newMileStone);
                        }
                    });
                }
            } else if (id === '需求规格说明文档') {
                // console.log("fuck")
                // console.log(MileStone)
                this.workingSpace.find(c => c.id === id).checkpoint = MileStone;
            }
        },
        load(progress) {
            try {
                if (progress.usecase.diagram.milestone) {
                    this.setWorkingSpace('用例图', progress.usecase.diagram.milestone);
                }
            } catch (error) {
                console.log(error)
            }

            try {
                if (progress.conceptual_class_diagram.milestone) {
                    this.setWorkingSpace('概念类图', progress.conceptual_class_diagram.milestone);
                }
            } catch (error) {
                console.log(error)
            }

            try {
                if (progress.state_diagram.milestone) {
                    this.setWorkingSpace('状态图', progress.state_diagram.milestone);
                }
            } catch (error) {
                console.log(error)
            }

            try {
                if (progress.system_sequence_diagram.milestone) {
                    this.setWorkingSpace('系统顺序图', progress.system_sequence_diagram.milestone);

                }
            } catch (error) {
                console.log(error)
            }
            try {
                if (progress.srs.milestone) {
                    this.setWorkingSpace('需求规格说明文档', progress.srs.milestone);
                }
            } catch (error) {
                console.log(error)
            }

            try {
                if (progress.usecase.specification.milestone) {
                    this.setWorkingSpace('用例分析文档', progress.usecase.specification.milestone);
                }
            } catch (error) {
                console.log(error)
            }

        },
        export() {
            let exportData = '';
            exportData += '## 用例图\n\n';
            exportData += '![]('
            exportData += this.paintImage(this.getWorkingSpace('用例图'));
            exportData += ')\n\n'
            exportData += '## 概念类图\n\n';
            exportData += '![]('
            exportData += this.paintImage(this.getWorkingSpace('概念类图'));
            exportData += ')\n\n'
            exportData += '## 状态图\n\n';
            exportData += '![]('
            exportData += this.paintImage(this.getWorkingSpace('状态图'));
            exportData += ')\n\n'
            exportData += '## 系统顺序图\n\n';
            exportData += '![]('
            exportData += this.paintImage(this.getWorkingSpace('系统顺序图'));
            exportData += ')\n\n'
            exportData += '## 用例说明文档\n\n';
            for (let index = 0; index < this.getWorkingSpace('用例分析文档').length; index++) {
                const element = this.getWorkingSpace('用例分析文档')[index];
                exportData += '### ' + element.name + '\n\n';
                exportData += element.description + '\n\n';
            }

            exportData += '## 需求规格说明文档\n\n';
            console.log(this.workingSpace.find(c => c.id === '需求规格说明文档'))

            console.log(this.workingSpace.find(c => c.id === '需求规格说明文档').checkpoint)
            exportData += this.convertRequirementsToText(this.workingSpace.find(c => c.id === '需求规格说明文档').checkpoint);
            return exportData;


        },
        paintImage(image) {
            let encodedMilestone = encode(image);
            let plantUmlUrl = `http://www.plantuml.com/plantuml/svg/${encodedMilestone}`;
            return plantUmlUrl;
        },
        convertRequirementsToText(checkpoint) {
            if (!checkpoint) return;
            console.log(checkpoint)
            let text = "";

            // Introduction section
            const intro = checkpoint.introduction;
            text += `### 引言\n\n`;
            for (let key in intro) {
                if (key === 'purpose') {
                    text += `#### 1.1 目的\n${intro[key]}\n\n`;
                } else if (key === 'scope') {
                    text += `#### 1.2 范围\n${intro[key]}\n\n`;
                } else if (key === 'definitions_acronyms_and_abbreviations') {
                    text += `#### 1.3 定义、首字母缩写和缩略语\n${intro[key]}\n\n`;
                } else if (key === 'references') {
                    text += `#### 1.4 参考文献\n${intro[key]}\n\n`;
                } else if (key === 'overview') {
                    text += `#### 1.5 文档组织\n${intro[key]}\n\n`;
                }
            }

            // Overall description section
            const overallDesc = checkpoint.overall_description;
            text += `### 总体描述\n\n`;
            for (let key in overallDesc) {
                if (key === 'product_perspective') {
                    text += `#### 2.1 产品前景\n${overallDesc[key]}\n\n`;
                } else if (key === 'product_functions') {
                    text += `#### 2.2 产品功能\n${overallDesc[key]}\n\n`;
                } else if (key === 'user_characteristics') {
                    text += `#### 2.3 用户特征\n${overallDesc[key]}\n\n`;
                } else if (key === 'constraints') {
                    text += `#### 2.4 约束\n${overallDesc[key]}\n\n`;
                } else if (key === 'assumptions_and_dependencies') {
                    text += `#### 2.5 假设和依赖\n${overallDesc[key]}\n\n`;
                }
            }

            // Specific requirements section
            const specReqs = checkpoint.specific_requirements;
            text += `### 详细需求描述\n\n`;

            // External interface requirements
            const extInterfaceReqs = specReqs.external_interface_requirements;
            text += `#### 3.1 对外接口需求\n`;
            for (let key in extInterfaceReqs) {
                if (key === 'user_interfaces') {
                    text += `##### 3.1.1 用户界面\n${extInterfaceReqs[key]}\n\n`;
                } else if (key === 'hardware_interfaces') {
                    text += `##### 3.1.2 硬件接口\n${extInterfaceReqs[key]}\n\n`;
                } else if (key === 'software_interfaces') {
                    text += `##### 3.1.3 教件接口\n${extInterfaceReqs[key]}\n\n`;
                } else if (key === 'communications_interfaces') {
                    text += `##### 3.1.4 通信接口\n${extInterfaceReqs[key]}\n\n`;
                }
            }

            // Functional requirements
            const funcReqs = specReqs.functional_requirements;
            text += `#### 3.2 功能需求\n`;
            funcReqs.forEach((feature, index) => {
                text += `##### 3.2.${index + 1} ${feature.feature_name}\n###### 3.2.${index + 1}.1 特性描述\n${feature.introduction_of_feature}\n\n`;
                text += `###### 3.2.${index + 1}.2 刺激/响应序列\n${feature.stimulus_response_sequence}\n\n`;
                text += `###### 3.2.${index + 1}.3 相关功能需求\n${feature.associated_functional_requirements}\n\n`;
            });

            // Performance requirements
            text += `#### 3.3 性能需求\n${specReqs.performance_requirements}\n\n`;

            // Design constraints
            text += `#### 3.4 约束\n${specReqs.design_constraints}\n\n`;

            // Software system attributes
            text += `#### 3.5 质量属性\n${specReqs.software_system_attributes}\n\n`;

            // Other requirements
            text += `#### 3.6 其他需求\n${specReqs.other_requirements || "无。"}\n\n`;

            return text;
        }
    }

});