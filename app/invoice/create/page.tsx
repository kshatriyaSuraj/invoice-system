"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Form,
  Input,
  DatePicker,
  Button,
  Table,
  InputNumber,
  Card,
  Row,
  Col,
  message,
  Space,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import api from "@/lib/api";

export default function CreateInvoicePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [items, setItems] = useState([
    {
      key: "1",
      itemNo: 1,
      description: "",
      qty: 1,
      rate: 0,
      igstPercent: 0,
      igstAmount: 0,
      amount: 0,
    },
  ]);
  const [totals, setTotals] = useState({
    subTotal: 0,
    igstTotal: 0,
    grandTotal: 0,
    balanceDue: 0,
    totalInWords: "",
  });

  // Convert number to words
  const numberToWords = (num: number): string => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];

    const convertBelowThousand = (n: number): string => {
      if (n === 0) return "";
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100)
        return (
          tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "")
        );
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 !== 0 ? " " + convertBelowThousand(n % 100) : "")
      );
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    if (rupees === 0 && paise === 0) return "Zero Only";

    let words = "";
    const crore = Math.floor(rupees / 10000000);
    const lakh = Math.floor((rupees % 10000000) / 100000);
    const thousand = Math.floor((rupees % 100000) / 1000);
    const remainder = rupees % 1000;

    if (crore > 0) words += convertBelowThousand(crore) + " Crore ";
    if (lakh > 0) words += convertBelowThousand(lakh) + " Lakh ";
    if (thousand > 0) words += convertBelowThousand(thousand) + " Thousand ";
    if (remainder > 0) words += convertBelowThousand(remainder);

    words = words.trim();
    if (paise > 0) words += " and " + convertBelowThousand(paise) + " Paise";

    return words + " Only";
  };

  // Calculate totals
  const calculateTotals = () => {
    let subTotal = 0;
    let igstTotal = 0;

    items.forEach((item) => {
      const itemAmount = (item.qty || 0) * (item.rate || 0);
      const itemIgst = (itemAmount * (item.igstPercent || 0)) / 100;
      subTotal += itemAmount;
      igstTotal += itemIgst;
    });

    const grandTotal = subTotal + igstTotal;
    setTotals({
      subTotal,
      igstTotal,
      grandTotal,
      balanceDue: grandTotal,
      totalInWords: numberToWords(grandTotal),
    });
  };

  useEffect(() => {
    calculateTotals();
  }, [items]);

  const handleItemChange = (key: string, field: string, value: any) => {
    const updatedItems = items.map((item) => {
      if (item.key === key) {
        const updated = { ...item, [field]: value };
        if (field === "qty" || field === "rate" || field === "igstPercent") {
          const itemAmount = (updated.qty || 0) * (updated.rate || 0);
          updated.igstAmount = (itemAmount * (updated.igstPercent || 0)) / 100;
          updated.amount = itemAmount + updated.igstAmount;
        }
        return updated;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const addItem = () => {
    const newItem = {
      key: Date.now().toString(),
      itemNo: items.length + 1,
      description: "",
      qty: 1,
      rate: 0,
      igstPercent: 0,
      igstAmount: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (key: string) => {
    if (items.length === 1) {
      message.warning("You must have at least one item");
      return;
    }
    setItems(items.filter((item) => item.key !== key));
  };

  const handleSubmit = async (values: any) => {
    if (items.length === 0) {
      message.error("Please add at least one item");
      return;
    }

    const invoiceData = {
      vendorName: values.vendorName,
      vendorAddressLine1: values.vendorAddressLine1,
      vendorAddressLine2: values.vendorAddressLine2 || "",
      invoiceNumber: values.invoiceNumber,
      invoiceDate: values.invoiceDate?.format("YYYY-MM-DD"),
      dueDate: values.dueDate?.format("YYYY-MM-DD"),
      terms: values.terms || "",
      clientName: values.clientName,
      clientAddress: values.clientAddress,
      clientCityCountry: values.clientCityCountry,
      clientPoc: values.clientPoc,
      items: items.map((item) => ({
        itemNo: item.itemNo,
        description: item.description,
        qty: item.qty,
        rate: item.rate,
        igstPercent: item.igstPercent,
        igstAmount: item.igstAmount,
        amount: item.amount,
      })),
      subTotal: totals.subTotal,
      igstTotal: totals.igstTotal,
      grandTotal: totals.grandTotal,
      balanceDue: totals.balanceDue,
      totalInWords: totals.totalInWords,
      notes: values.notes || "",
      accountHolder: values.accountHolder,
      accountNumber: values.accountNumber,
      ifsc: values.ifsc,
      branch: values.branch,
      branchCode: values.branchCode || "",
      signatureName: values.signatureName,
      signatureTitle: values.signatureTitle,
    };

    try {
      const res = await api.post("/invoice/create", invoiceData);
      if (res.status === 201 || res.status === 200) {
        message.success("Invoice created successfully");
        router.push("/");
      }
    } catch (error) {
      message.error("Error creating invoice");
      console.error(error);
    }
  };

  const columns = [
    {
      title: "No.",
      dataIndex: "itemNo",
      key: "itemNo",
      width: 50,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (_: any, record: any) => (
        <Input
          value={record.description}
          onChange={(e) =>
            handleItemChange(record.key, "description", e.target.value)
          }
          placeholder="Item description"
          size="small"
        />
      ),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 70,
      render: (_: any, record: any) => (
        <InputNumber
          value={record.qty}
          onChange={(val) => handleItemChange(record.key, "qty", val)}
          size="small"
          min={1}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Rate (₹)",
      dataIndex: "rate",
      key: "rate",
      width: 100,
      render: (_: any, record: any) => (
        <InputNumber
          value={record.rate}
          onChange={(val) => handleItemChange(record.key, "rate", val)}
          size="small"
          min={0}
          precision={2}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "IGST %",
      dataIndex: "igstPercent",
      key: "igstPercent",
      width: 80,
      render: (_: any, record: any) => (
        <InputNumber
          value={record.igstPercent}
          onChange={(val) => handleItemChange(record.key, "igstPercent", val)}
          size="small"
          min={0}
          max={100}
          precision={2}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "IGST (₹)",
      dataIndex: "igstAmount",
      key: "igstAmount",
      width: 100,
      render: (_: any, record: any) => (
        <span>₹ {(record.igstAmount || 0).toFixed(2)}</span>
      ),
    },
    {
      title: "Amount (₹)",
      dataIndex: "amount",
      key: "amount",
      width: 110,
      render: (_: any, record: any) => (
        <span>₹ {(record.amount || 0).toFixed(2)}</span>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 60,
      render: (_: any, record: any) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
          size="small"
        />
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#fafafa", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: "24px" }}
        >
          <Col>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                margin: "0 0 8px 0",
              }}
            >
              Create Invoice
            </h1>
            <p style={{ color: "#666", margin: 0, fontSize: "14px" }}>
              Fill in the details below to create a new invoice
            </p>
          </Col>
          <Col>
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/")}
              size="large"
            >
              Back to Invoices
            </Button>
          </Col>
        </Row>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {/* ============ VENDOR SECTION ============ */}
          <Card title="1. Vendor Information" style={{ marginBottom: "24px" }}>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="vendorName"
                  label="Vendor Name"
                  rules={[
                    {
                      required: true,
                      message: "Vendor name is required",
                    },
                  ]}
                >
                  <Input placeholder="Enter vendor name" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]}>
              <Col xs={24}>
                <Form.Item
                  name="vendorAddressLine1"
                  label="Address Line 1"
                  rules={[
                    {
                      required: true,
                      message: "Address is required",
                    },
                  ]}
                >
                  <Input placeholder="Enter address line 1" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]}>
              <Col xs={24}>
                <Form.Item
                  name="vendorAddressLine2"
                  label="Address Line 2 (Optional)"
                  rules={[{ required: false }]}
                >
                  <Input placeholder="Enter address line 2" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ============ INVOICE INFORMATION ============ */}
          <Card title="2. Invoice Information" style={{ marginBottom: "24px" }}>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="invoiceNumber"
                  label="Invoice Number"
                  rules={[
                    {
                      required: true,
                      message: "Invoice number is required",
                    },
                  ]}
                >
                  <Input placeholder="INV-001" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="invoiceDate"
                  label="Invoice Date"
                  rules={[
                    {
                      required: true,
                      message: "Invoice date is required",
                    },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="dueDate"
                  label="Due Date"
                  rules={[
                    {
                      required: true,
                      message: "Due date is required",
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="terms"
                  label="Terms & Conditions"
                  rules={[{ required: false }]}
                >
                  <Input placeholder="Payment terms (optional)" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ============ CLIENT INFORMATION ============ */}
          <Card title="3. Client Information" style={{ marginBottom: "24px" }}>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="clientName"
                  label="Client Name"
                  rules={[
                    {
                      required: true,
                      message: "Client name is required",
                    },
                  ]}
                >
                  <Input placeholder="Enter client name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="clientPoc"
                  label="Point of Contact (Phone)"
                  rules={[
                    {
                      required: true,
                      message: "Phone number is required",
                    },
                    {
                      pattern: /^[0-9]{10}$/,
                      message: "Phone must be 10 digits",
                    },
                  ]}
                >
                  <Input placeholder="10-digit phone number" maxLength={10} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]}>
              <Col xs={24}>
                <Form.Item
                  name="clientAddress"
                  label="Address"
                  rules={[
                    {
                      required: true,
                      message: "Client address is required",
                    },
                  ]}
                >
                  <Input.TextArea placeholder="Enter client address" rows={2} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]}>
              <Col xs={24}>
                <Form.Item
                  name="clientCityCountry"
                  label="City & Country"
                  rules={[
                    {
                      required: true,
                      message: "City & country is required",
                    },
                  ]}
                >
                  <Input placeholder="City, Country" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ============ ITEMS SECTION ============ */}
          <Card title="4. Line Items" style={{ marginBottom: "24px" }}>
            <Table
              columns={columns}
              dataSource={items}
              pagination={false}
              size="small"
              rowKey="key"
              scroll={{ x: 800 }}
            />
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addItem}
              style={{ marginTop: "16px", width: "100%" }}
            >
              Add Item
            </Button>
          </Card>

          {/* ============ TOTALS SECTION ============ */}
          <Card title="5. Totals" style={{ marginBottom: "24px" }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div
                  style={{
                    padding: "16px",
                    background: "#f5f5f5",
                    borderRadius: "4px",
                  }}
                >
                  <Row justify="space-between" style={{ marginBottom: "12px" }}>
                    <Col>
                      <span style={{ fontWeight: 500 }}>Subtotal:</span>
                    </Col>
                    <Col>
                      <span>₹ {totals.subTotal.toFixed(2)}</span>
                    </Col>
                  </Row>
                  <Row justify="space-between" style={{ marginBottom: "12px" }}>
                    <Col>
                      <span style={{ fontWeight: 500 }}>IGST Total:</span>
                    </Col>
                    <Col>
                      <span>₹ {totals.igstTotal.toFixed(2)}</span>
                    </Col>
                  </Row>
                  <Row
                    justify="space-between"
                    style={{ fontWeight: "bold", fontSize: "16px" }}
                  >
                    <Col>
                      <span>Grand Total:</span>
                    </Col>
                    <Col>
                      <span>₹ {totals.grandTotal.toFixed(2)}</span>
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Total in Words">
                  <Input value={totals.totalInWords} disabled />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ============ NOTES SECTION ============ */}
          <Card
            title="6. Additional Notes (Optional)"
            style={{ marginBottom: "24px" }}
          >
            <Form.Item name="notes" rules={[{ required: false }]}>
              <Input.TextArea
                placeholder="Add any additional notes or terms..."
                rows={4}
              />
            </Form.Item>
          </Card>

          {/* ============ BANK DETAILS ============ */}
          <Card title="7. Bank Details" style={{ marginBottom: "24px" }}>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="accountHolder"
                  label="Account Holder"
                  rules={[
                    {
                      required: true,
                      message: "Account holder is required",
                    },
                  ]}
                >
                  <Input placeholder="Account holder name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="accountNumber"
                  label="Account Number"
                  rules={[
                    {
                      required: true,
                      message: "Account number is required",
                    },
                    {
                      pattern: /^\d{9,18}$/,
                      message: "Account number must be 9-18 digits",
                    },
                  ]}
                >
                  <Input placeholder="Account number" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="ifsc"
                  label="IFSC Code"
                  rules={[
                    {
                      required: true,
                      message: "IFSC code is required",
                    },
                    {
                      pattern: /^[A-Z]{4}0[A-Z0-9]{6}$/,
                      message: "Invalid IFSC format (e.g., SBIN0001234)",
                    },
                  ]}
                >
                  <Input placeholder="IFSC Code (e.g., SBIN0001234)" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="branch"
                  label="Branch Name"
                  rules={[
                    {
                      required: true,
                      message: "Branch name is required",
                    },
                  ]}
                >
                  <Input placeholder="Branch name" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="branchCode"
                  label="Branch Code (Optional)"
                  rules={[{ required: false }]}
                >
                  <Input placeholder="Branch code" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ============ SIGNATURE ============ */}
          <Card title="8. Signature" style={{ marginBottom: "24px" }}>
            <Row gutter={[16, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="signatureName"
                  label="Signature Name"
                  rules={[
                    {
                      required: true,
                      message: "Signature name is required",
                    },
                  ]}
                >
                  <Input placeholder="Authorized signatory name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="signatureTitle"
                  label="Title"
                  rules={[
                    {
                      required: true,
                      message: "Title is required",
                    },
                  ]}
                >
                  <Input placeholder="Title (e.g., Director, Manager)" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* ============ ACTION BUTTONS ============ */}
          <Space style={{ marginBottom: "24px" }}>
            <Button type="primary" htmlType="submit" size="large">
              Save Invoice
            </Button>
            <Button onClick={() => router.push("/")} size="large">
              Cancel
            </Button>
          </Space>
        </Form>
      </div>
    </div>
  );
}
