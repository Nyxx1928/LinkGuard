# Migration Guide

## Overview
This project replaces legacy UI components with shadcn/ui primitives and glassmorphism styling.

## Button
Old:
```jsx
<Button variant="primary">Save</Button>
```
New:
```jsx
<Button variant="primary" icon={<Save className="h-4 w-4" />}>
  Save
</Button>
```

## Card
Old:
```jsx
<div className="card">...</div>
```
New:
```jsx
<Card variant="elevated" padding="lg">...</Card>
```

## Input
Old:
```jsx
<input className="input" />
```
New:
```jsx
<Input label="Target" error={error} icon={<Search className="h-4 w-4" />} />
```

## Charts and Maps
- Use `LazyRiskChart` to defer chart bundle loading.
- Use `LazyGeoMap` to defer map bundle loading.

## Layout
- Wrap pages with `PageContainer` and include `PageHeader` + `Footer`.
- Use `Container` for inner width control when needed.
