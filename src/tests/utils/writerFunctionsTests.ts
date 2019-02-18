import { expect } from "chai";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { Project } from "../../Project";
import { TypeElementMemberedNodeStructure } from "../../structures";
import { WriterFunction } from "../../types";
import { WriterFunctions } from "../../utils";
import { StructurePrinterFactory } from '../../factories';
import { getStructureFactoryAndWriter } from '../testHelpers';

describe(nameof<WriterFunctions>(), () => {
    function getWriter() {
        return new CodeBlockWriter();
    }

    function doWriterTest(action: (writer: CodeBlockWriter, structurePrinterFactory: StructurePrinterFactory, writerFunctions: WriterFunctions) => void, expected: string) {
        const project = new Project({ useVirtualFileSystem: true });
        const writerFunctions = project.getWriterFunctions();
        const { writer, factory } = getStructureFactoryAndWriter();
        action(writer, factory, writerFunctions);
        expect(writer.toString()).to.equal(expected);
    }

    describe(nameof<WriterFunctions>(f => f.object), () => {
        function doTest(obj: { [key: string]: string | number | WriterFunction | undefined; }, expected: string) {
            doWriterTest((writer, structurePrinterFactory, { object }) => object(obj)(writer, structurePrinterFactory), expected);
            // will deprecate this later
            doWriterTest((writer, structurePrinterFactory) => WriterFunctions.object(obj)(writer, structurePrinterFactory), expected);
        }

        it("should write an object with keys", () => {
            doTest({
                key1: "'testing'",
                key2: 5,
                key3: undefined,
                key4: writer => writer.write("6"),
                key5: "undefined"
            }, `{
    key1: 'testing',
    key2: 5,
    key3,
    key4: 6,
    key5: undefined
}`);
        });

        it("should write an object without keys on the same line", () => {
            doTest({}, `{}`);
        });
    });

    describe(nameof<WriterFunctions>(f => f.objectType), () => {
        function doTest(obj: TypeElementMemberedNodeStructure, expected: string) {
            doWriterTest((writer, structurePrinterFactory, { objectType }) => objectType(obj)(writer, structurePrinterFactory), expected);
        }

        it("should write an object type with only properties", () => {
            doTest({
                properties: [{ name: "prop" }]
            }, `{
    prop;
}`);
        });

        it("should write an object type with only methods", () => {
            doTest({
                methods: [{ name: "method" }]
            }, `{
    method();
}`);
        });

        it("should write an object type with only call signatures", () => {
            doTest({
                callSignatures: [{}]
            }, `{
    (): void;
}`);
        });

        it("should write an object type with only construct signatures", () => {
            doTest({
                constructSignatures: [{}]
            }, `{
    new();
}`);
        });

        it("should write an object type with only index signatures", () => {
            doTest({
                indexSignatures: [{}]
            }, `{
    [key: string];
}`);
        });

        it("should write an object type with everything", () => {
            const structure: MakeRequired<TypeElementMemberedNodeStructure> = {
                callSignatures: [{}],
                constructSignatures: [{}],
                indexSignatures: [{}],
                properties: [{ name: "prop" }],
                methods: [{ name: "method" }]
            };

            doTest(structure, `{
    (): void;
    new();
    [key: string];
    prop;
    method();
}`);
        });

        it("should write an object without keys on the same line", () => {
            doTest({}, `{}`);
        });
    });

    describe(nameof<WriterFunctions>(f => f.unionType), () => {
        it("should write when only specifying two types", () => {
            doWriterTest((writer, factory, { unionType }) => unionType("C", "A")(writer, factory), "C | A");
        });

        it("should write when specifying more than two types", () => {
            doWriterTest((writer, factory, { unionType }) => unionType("C", "A", w => w.write("5"), 7)(writer, factory), "C | A | 5 | 7");
        });
    });

    describe(nameof<WriterFunctions>(f => f.intersectionType), () => {
        it("should write when only specifying two types", () => {
            doWriterTest((writer, factory, { intersectionType }) => intersectionType("C", "A")(writer, factory), "C & A");
        });

        it("should write when specifying more than two types", () => {
            doWriterTest((writer, factory, { intersectionType }) => intersectionType("C", "A", w => w.write("5"), 7)(writer, factory), "C & A & 5 & 7");
        });
    });
});
